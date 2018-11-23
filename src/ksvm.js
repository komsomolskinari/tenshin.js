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

export default class KSVM {
    static Init() {
        this.runmode = VM_SCENE;
        this.dispmode = VM_NORMAL;
        this.hang = false;
        // scripts = {name: script}
        this.scripts = {};
        this.tags = {};
        // [script name, line#]
        this.currentpos = { "script": null, "line": 1 };
        this.posstack = [];
        this.runlock = false;
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
            // NOTE: macro is not implement, use native implement instead
            switch (cmd.type) {
                case "entry":
                    break;
                case "func":
                    let next = await Runtime.Call(cmd);
                    // Okay, comand return a new position, lets use it
                    if (next !== undefined) {
                        this.currentpos = this.LocateTag(next[0], next[1]);
                        if (this.currentpos === undefined) debugger;
                    }
                    break;
                case "text":
                    Runtime.Text(cmd);
                    if (this.runmode == VM_SCENE) this.hang = true;
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
        this.runmode = VM_SCENE;
        this.dispmode = VM_NORMAL;
        this.hang = false;
        AsyncTask.Cancel();
        await this.Run();
    }
}
KSVM.Init();
window.KSVM = KSVM;