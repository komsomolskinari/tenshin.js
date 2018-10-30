import { Runtime } from "./runtime";

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

export class KSVM {

    constructor(runtime) {
        this.runtime = runtime;
        runtime.vm = this;
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

    AddScript(name, script) {
        this.scripts[name] = script;
        // scan tags
        var lineno = 0;
        for (const s of script) {
            if (s.type == "entry") {
                if (this.tags[s.name] === undefined) this.tags[s.name] = [];
                this.tags[s.name].push({ "script": name, "line": lineno });
            }
            lineno++;
        }
    }

    LocateTag(tag, script) {
        const ts = this.tags[tag.substr(1)];
        if (script === undefined) return ts[0];
        else {
            for (const t of ts) {
                if (t.script == script.split('.')[0]) return t;
            }
        }
        return undefined;
    }

    CurrentCmd() {
        return this.scripts[this.currentpos.script][this.currentpos.line]
    }

    // main entry
    Run() {
        if (this.runlock) return;
        this.runlock = true;
        while (!this.hang) {
            if (this.currentpos.line >= this.scripts[this.currentpos.script].length) {
                // too far
                this.hang = true;
                console.log("EOF");
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
                                var r = this.runtime.TJSeval(cmd.param.eval);
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
                            var next = this.runtime.MapSelect();
                            if (next !== undefined) {
                                if (next[0] !== undefined) {
                                    this.currentpos = this.LocateTag(next[0], next[1]);
                                }
                            }
                            break;
                        case "select":
                            var next = this.runtime.Select();
                            if (next !== undefined) {
                                if (next[0] !== undefined) {
                                    this.currentpos = this.LocateTag(next[0], next[1]);
                                }
                            }
                            break;
                        default:
                            this.runtime.Call(cmd);
                            break;
                    }
                    break;
                // output text
                case "text":
                    this.runtime.Text(cmd);
                    if (this.runmode == VM_SCENE) this.hang = true;
                    break;
            }
            this.currentpos.line++;
        }
        this.runlock = false;
    }

    // run from *tag, used for playback
    RunFrom(tag) {
        this.currentpos = this.tags[tag][0];
        this.runlock = false;
        this.Run();
    }

    // VM Control Functions
    // .
    Next() {
        this.runmode = VM_SCENE;
        this.dispmode = VM_NORMAL;
        this.hang = false;
        this.Run();
    }

    // >
    Auto() {
        this.runmode = VM_SELECT;
        this.dispmode = VM_AUTO;
        this.hang = false;
        this.Run();
    }

    // debug only
    Step() {
        this.runmode = VM_STEP;
        this.dispmode = VM_NORMAL;
        this.hang = false;
        this.Run();
    }

    // >> 
    Jump() {
        this.runmode = VM_NEVER;
        this.dispmode = VM_QUICK;
        this.hang = false;
        this.Run();
    }

    // >|
    NextSelect() {
        this.runmode = VM_SCENE;
        this.dispmode = VM_NONE;
        this.hang = false;
        this.Run();
    }

    // <
    BackLog() {

    }

    // <<
    Back() {

    }

    // |<
    LastSelect() {

    }

    // VM Save and load
    // save internal status
    Save() {

    }

    // load
    Load(status) {

    }
}