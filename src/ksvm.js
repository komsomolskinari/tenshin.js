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

    static AddScript(name, script) {
        this.scripts[name] = script;
        // scan tags
        let lineno = 0;
        for (const s of script) {
            if (s.type == "entry") {
                if (this.tags[s.name] === undefined) this.tags[s.name] = [];
                this.tags[s.name].push({ "script": name, "line": lineno });
            }
            lineno++;
        }
    }

    /**
     * Locate a KS tag
     * @param {String} tag tag name, with *
     * @param {String} script script name
     */
    static LocateTag(tag, script) {
        console.log(tag, script);
        if (script == undefined) debugger;
        script = script.match(/(.+?)\.([^.]*$|$)/i)[1];
        // No tag, return first line of script
        if (tag === undefined) {
            return { script: script, line: 0 };
        }
        const tags = this.tags[tag.substr(1)];
        if (script === undefined) return ts[0];
        else {
            for (const tag of tags) {
                if (tag.script == script) return tag;
            }
        }
        return undefined;
    }

    static CurrentCmd() {
        return this.scripts[this.currentpos.script][this.currentpos.line]
    }

    // main entry
    static async Run() {
        if (this.runlock) return;
        this.runlock = true;
        while (!this.hang) {
            if (this.currentpos.line >= this.scripts[this.currentpos.script].length) {
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