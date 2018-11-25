import Runtime from "./runtime";
import AsyncTask from "./async/asynctask";
import TJSVM from './tjsvm';

// when to hang up vm
let VM_STEP = 0;
let VM_SCENE = 1;
let VM_SELECT = 2;
let VM_NEVER = 3;
// vm display mode
let VM_NORMAL = 0; // standard mode
let VM_AUTO = 1; // wait for voice end
let VM_QUICK = 2; // fixed interval
let VM_NONE = 3; // no output

const VMMode = {
    Step: 0,    // stop per step
    Text: 1,    // stop per text
    Auto: 2,    // stop per text, wait all async operation, and continue
    Quick: 3,   // stop per text, continue after 20 ms?
    Select: 4,  // stop when jump occured, shutdown ui
}

export default class KSVM {
    static Init() {
        this.mode = VMMode.Step;
        this.hang = false;
        // scripts = {name: script}
        this.scripts = {};
        this.tags = {};
        // [script name, line#]
        this.currentpos = { "script": null, "line": 1 };
        this.posstack = [];
        this.runlock = false;
        this.breakPoints = [];
    }

    /**
     * Add a script file to VM
     * @param {String} name file name, without extension
     * @param {*} script compiled script
     */
    static AddScript(name, script) {
        if (Object.keys(this.scripts).includes(name)) {
            console.debug(`AddScript: duplicate script ${name}`)
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
            .filter(l => l.type == "entry")
            .forEach(l => {
                this.AddTag(l.name, name, l.line)
            });
    }

    static AddTag(name, script, line) {
        if (this.tags[name] === undefined) this.tags[name] = [];
        this.tags[name].push({
            script: script,
            line: line
        });
    }

    static AddBreakPoint(script, line) {
        this.breakPoints.push({ script, line });
    }

    static RemoveBreakPoint(script, line) {
        this.breakPoints = this.breakPoints.filter(l => l.script != script || l.line != line);
    }

    /**
     * Locate a KS tag
     * @param {String} tag tag name, with *
     * @param {String} script script name
     */
    static LocateTag(tag, script) {
        script = script.match(/(.+?)\.([^.]*$|$)/i)[1];
        // No tag, return first line of script
        if (tag === undefined) {
            return { script: script, line: 0 };
        }
        const tags = this.tags[tag.substr(1)];
        if (script === undefined) return tags[0];
        else {
            for (const t of tags) {
                if (t.script == script) return t;
            }
        }
        return undefined;
    }

    /**
     * Get current command
     */
    static CurrentCmd() {
        return this.scripts[this.currentpos.script][this.currentpos.line]
    }

    static HitBreakPoint(position) {
        //let bpeq = (p1, p2) => ((p1.script === p2.script) && (p1.line === p2.line));
        if (this.breakPoints.length == 0) return false;
        let cur = this.breakPoints
            .filter(l => l.script == position.script)   // we can cache breakpoint later
            .map(l => l.line);
        if (cur.includes(position.line)) return true;
        else return false;
    }

    // main entry
    static async Run() {
        if (this.runlock) return;
        this.runlock = true;
        while (!this.hang) {
            if (this.HitBreakPoint(this.currentpos)) debugger;
            if (this.CurrentCmd() === undefined) {
                // too far
                this.hang = true;
                console.debug("EOF");
                return;
            }
            const cmd = this.CurrentCmd();
            // NOTE: macro is not implement, use native implement instead
            switch (cmd.type) {
                case "entry":
                    break;
                case "func":
                    let next = await Runtime.Call(cmd);
                    // Okay, comand return a new position, lets use it
                    if (next !== undefined) {
                        if (this.mode == VMMode.Step) this.hang = true;
                        this.currentpos = this.LocateTag(next[0], next[1]);
                        if (this.currentpos === undefined) debugger;
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
            this.currentpos.line++;
        }
        this.runlock = false;
    }

    // run from *tag, used for playback
    static async RunFrom(tag) {
        this.currentpos = this.tags[tag][0];
        this.runlock = false;
        await this.Run();
    }

    // VM Control Functions
    // .
    static async Next() {
        this.hang = false;
        AsyncTask.Cancel();
        await this.Run();
    }
}
KSVM.Init();
window.KSVM = KSVM;