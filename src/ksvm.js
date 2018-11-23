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

    static LocateTag(tag, script) {
        const ts = this.tags[tag.substr(1)];
        if (script === undefined) return ts[0];
        else {
            for (const t of ts) {
                if (t.script == script.split('.')[0]) return t;
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
                // skip entry
                case "entry":
                    break;
                // exec functions
                case "func":
                    switch (cmd.name) {
                        case "next":
                            // Let runtime handle these logic?
                            if (cmd.param.eval != undefined) {
                                // tjs eval
                                let r = TJSVM.eval(cmd.param.eval);
                                // eval false, cancel jump
                                if (!r) break;
                            }
                            // no target tag defined, directly load script
                            if (cmd.param.target == undefined) {
                                this.currentpos = { "script": cmd.param.storage.split('.')[0], "line": 0 };
                            }
                            // or locate the tag
                            else {
                                this.currentpos = this.LocateTag(cmd.param.target, cmd.param.storage);
                            }
                            break;

                        // mselect & select should have same entry?
                        // make runtime do these too?
                        case "mselect":
                            {
                                let next = await Runtime.MapSelect();
                                if (next !== undefined) {
                                    if (next[0] !== undefined) {
                                        this.currentpos = this.LocateTag(next[0], next[1]);
                                    }
                                }
                            }
                            break;
                        case "select":
                            {
                                let next = await Runtime.Select();
                                if (next !== undefined) {
                                    if (next[0] !== undefined) {
                                        this.currentpos = this.LocateTag(next[0], next[1]);
                                    }
                                }
                            }
                            break;
                        default:
                            await Runtime.Call(cmd);
                            break;
                    }
                    break;
                // output text
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

    // >
    static async Auto() {
        this.runmode = VM_SELECT;
        this.dispmode = VM_AUTO;
        this.hang = false;
        await this.Run();
    }

    // debug only
    static Step() {
        this.runmode = VM_STEP;
        this.dispmode = VM_NORMAL;
        this.hang = false;
        this.Run();
    }

    // >> 
    static Jump() {
        this.runmode = VM_NEVER;
        this.dispmode = VM_QUICK;
        this.hang = false;
        this.Run();
    }

    // >|
    static NextSelect() {
        this.runmode = VM_SCENE;
        this.dispmode = VM_NONE;
        this.hang = false;
        this.Run();
    }

    // <
    static BackLog() {

    }

    // <<
    static Back() {

    }

    // |<
    static LastSelect() {

    }

    // VM Save and load
    // save internal status
    static Save() {

    }

    // load
    static Load(status) {

    }
}
KSVM.Init();
window.KSVM = KSVM;