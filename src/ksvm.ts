/// <reference path="./public.d.ts" />

import { LogVMCmd } from "./debugtool";
import Runtime from "./runtime";
import TJSVM from "./tjsvm";

enum VMMode {
    Step,   // stop per step
    Text,   // stop per text
    Auto,   // stop per text, wait all async operation, and continue
    Quick,  // stop per text, continue after 20 ms?
    Select, // stop when jump occured, shutdown ui
}

export default class KSVM {
    static mode = VMMode.Text;
    static hang = false;
    static scripts: {
        [name: string]: KSLine[]
    } = {};
    static macros: {
        [name: string]: KSLine[]
    } = {};
    static tags: {
        [name: string]: VMPosition[]
    } = {};
    static currentpos: VMPosition = { script: undefined, line: 1 };
    static posstack: VMPosition[] = [];
    static runlock = false;
    static breakPoints: VMPosition[] = [];


    /**
     * Add a script file to VM
     * @param scriptName file name, without extension
     * @param script compiled script
     */
    static AddScript(scriptName: string, script: KSLine[]) {
        if (Object.keys(this.scripts).includes(scriptName)) {
            console.debug("%c AddScript: duplicate script %s", "color:grey", scriptName);
            return;
        }
        this.scripts[scriptName] = script;
        // scan tags
        script
            .map((l, i) => {
                return ({
                    name: l.name,
                    type: l.type,
                    line: i
                });
            })
            .filter(l => l.type === "entry")
            .forEach(l => this.AddTag(l.name, scriptName, l.line));
        // scan macros
        let inMacro = false;
        let currentMacro = [];
        let currentMName = "";

        for (const element of script) {
            if (element.name === "macro" && element.type === "func") {
                if (currentMacro.length > 0) {
                    this.AddMacro(currentMName, currentMacro);
                }
                currentMName = String(element.param.name);
                currentMacro = [];
                inMacro = true;
            }
            else if (element.name === "endmacro" && element.type === "func") {
                if (currentMacro.length > 0) {
                    this.AddMacro(currentMName, currentMacro);
                }
                currentMName = "";
                currentMacro = [];
                inMacro = false;
            }
            else if (inMacro) {
                currentMacro.push(element);
            }
        }
    }

    static AddTag(tagName: string, scriptName: string, line: number) {
        if (this.tags[tagName] === undefined) this.tags[tagName] = [];
        this.tags[tagName].push({
            script: scriptName,
            line
        });
    }

    static AddMacro(scriptName: string, script: KSLine[]) {
        this.macros[scriptName] = script;
    }

    static AddBreakPoint(scriptName: string, line: number) {
        this.breakPoints.push({ script: scriptName, line });
    }

    static RemoveBreakPoint(scriptName: string, line: number) {
        this.breakPoints = this.breakPoints.filter(l => l.script !== scriptName || l.line !== line);
    }

    /**
     * Locate a KS tag
     * @param tag tag name, with *
     * @param script script name
     */
    static LocateTag(dest: JumpDest): VMPosition {
        if (!dest) return undefined;
        let script = dest.script;
        const target = dest.target;
        if (script) script = script.split(".")[0];
        // No tag, return first line of script
        if (target === undefined) {
            return { script, line: 0 };
        }
        const tags = this.tags[target.substr(1)];
        if (script === undefined) return (tags || [])[0];
        else {
            for (const t of tags) {
                if (t.script === script) return t;
            }
        }
        return undefined;
    }

    /**
     * Get current command
     */
    static CurrentCmd(): KSLine {
        return this.scripts[this.currentpos.script][this.currentpos.line];
    }

    static CheckBreakPoint(position: VMPosition) {
        // let bpeq = (p1, p2) => ((p1.script === p2.script) && (p1.line === p2.line));
        if (this.breakPoints.length === 0) return false;
        const cur = this.breakPoints
            .filter(l => l.script === position.script)   // we can cache breakpoint later
            .map(l => l.line);
        if (cur.includes(position.line)) return true;
        else return false;
    }

    // main entry
    static async Run() {
        if (this.runlock) return;
        this.runlock = true;
        while (!this.hang) {
            if (this.CurrentCmd() === undefined) {
                // too far
                this.hang = true;
                console.debug("EOF");
                return;
            }
            const cmd = this.CurrentCmd();
            if (this.CheckBreakPoint(this.currentpos)) {
                this.hang = true;
                this.runlock = true;
                debugger;
            }
            const next = await this.Step(cmd);
            LogVMCmd(cmd);
            // Okay, comand return a new position, lets use it
            if (next !== undefined) {
                if (this.mode === VMMode.Step) this.hang = true;
                this.currentpos = this.LocateTag(next);
            }
            if (VMMode.Step) this.hang = true;
            this.currentpos.line++;
        }
        this.runlock = false;
    }

    static async Step(cmd: KSLine): Promise<JumpDest> {
        // NOTE: macro is not implement, use native implement instead
        switch (cmd.type) {
            case "entry":
                return undefined;
            case "func":
                cmd.trace = this.currentpos;
                if (cmd.param.cond) {
                    const val = TJSVM.eval(cmd.param.cond);
                    if (!val) return undefined;
                }
                return Runtime.Call(cmd);
            case "text":
                Runtime.Text(cmd);
                if ([
                    VMMode.Auto,
                    VMMode.Quick,
                    VMMode.Text].includes(this.mode)
                ) {
                    this.hang = true;
                }
                return undefined;
        }
    }

    // run from *tag, used for playback
    static async RunFrom(tag: string) {
        this.currentpos = this.tags[tag][0];
        this.runlock = false;
    }

    // VM Control Functions
    // .
    static async Next() {
        this.hang = false;
        this.mode = VMMode.Text;
        await this.Run();
    }
}
