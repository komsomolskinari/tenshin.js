/// <reference path="./public.d.ts" />

import AsyncTask from "./async/asynctask";
import { VMMode } from "./const";
import Runtime from "./runtime";
export default class KSVM {
    static mode = VMMode.Text;
    static hang = false;
    // scripts = {name: script}
    static scripts: {
        [name: string]: KSLine[]
    } = {};
    static macros: {
        [name: string]: KSLine[]
    } = {};
    static tags: {
        [name: string]: VMPosition[]
    } = {};
    // [script name, line#]
    static currentpos: VMPosition = { script: undefined, line: 1 };
    static posstack: VMPosition[] = [];
    static runlock = false;
    static breakPoints: VMPosition[] = [];


    /**
     * Add a script file to VM
     * @param name file name, without extension
     * @param script compiled script
     */
    static AddScript(name: string, script: KSLine[]) {
        if (Object.keys(this.scripts).includes(name)) {
            console.debug("%c AddScript: duplicate script %s", "color:grey", name);
            return;
        }
        this.scripts[name] = script;
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
            .forEach(l => this.AddTag(l.name, name, l.line));
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

    static AddTag(name: string, script: string, line: number) {
        if (this.tags[name] === undefined) this.tags[name] = [];
        this.tags[name].push({
            script,
            line
        });
    }

    static AddMacro(name: string, script: KSLine[]) {
        this.macros[name] = script;
    }

    static AddBreakPoint(script: string, line: number) {
        this.breakPoints.push({ script, line });
    }

    static RemoveBreakPoint(script: string, line: number) {
        this.breakPoints = this.breakPoints.filter(l => l.script !== script || l.line !== line);
    }

    /**
     * Locate a KS tag
     * @param tag tag name, with *
     * @param script script name
     */
    static LocateTag(tag: string, script: string) {
        if (script) script = script.split(".")[0];
        // No tag, return first line of script
        if (tag === undefined) {
            return { script, line: 0 };
        }
        const tags = this.tags[tag.substr(1)];
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

    static HitBreakPoint(position: VMPosition) {
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
            if (this.HitBreakPoint(this.currentpos)) {
                this.hang = true;
                this.runlock = true;
                debugger;
            }
            // NOTE: macro is not implement, use native implement instead
            switch (cmd.type) {
                case "entry":
                    break;
                case "func":
                    cmd.trace = this.currentpos;
                    const next = await Runtime.Call(cmd);
                    // Okay, comand return a new position, lets use it
                    if (next !== undefined) {
                        debugger;
                        if (this.mode === VMMode.Step) this.hang = true;
                        this.currentpos = this.LocateTag(next[0], next[1]);
                    }
                    break;
                case "text":
                    Runtime.Text(cmd);
                    if ([
                        VMMode.Auto,
                        VMMode.Quick,
                        VMMode.Text].includes(this.mode)
                    ) {
                        this.hang = true;
                    }
                    break;
            }
            console.debug(cmd, this.currentpos);
            if (VMMode.Step) this.hang = true;
            this.currentpos.line++;
        }
        this.runlock = false;
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
        AsyncTask.Cancel();
        await this.Run();
    }
}
