// runtime libs
import Character from './character';
import ObjectMapper from './objectmapper';
import YZBgImg from './ui/bgimg';
import YZSound from './ui/sound';
import YZText from './ui/text';
import TJSeval from './utils/tjseval';
import YZCG from './ui/cg';
import YZVideo from './ui/video';

export default class Runtime {
    static Init() {
        // key: var name
        this.TJSvar = {};
        // set tjs eval native implement hack
        // only use when fail
        // key: input string
        // value: return value
        this.TJShack = {};
        this.MapSelectData = [];
        this.SelectData = [];

        this.inTrans = false;
        this.transSeq = [];
    }

    // Text related commands
    // 
    static Text(cmd) {
        let { text, name, display } = cmd;
        if (name) {
            let ch = Character.characters[name];
            Character.voiceBase = this.TJSvar['f.voiceBase'];
            ch.Text(text, display);
        }
        else {
            YZText.Print(text, display);
        }
    }

    // TODO: mselect is Tenshin Ranman only command?
    // add map select option
    static MapSelectAdd(cmd) {
        this.MapSelectData.push([
            cmd.param.name,
            cmd.param.target,
            cmd.param.cond,
            cmd.param.storage,
            cmd.param.place,
        ]);
    }

    // raise a map select
    static async MapSelect() {
        var s = "Map:\n";
        var n = 0;
        for (const d of this.MapSelectData) {
            s += n;
            s += d[0];
            s += '\n';
            n++;
        }
        var r = prompt(s, 0);
        var ro = this.MapSelectData[r];
        this.MapSelectData = [];
        return [ro[1], ro[3]];
    }

    static SelectAdd(cmd) {
        this.SelectData.push([
            cmd.param.text,
            cmd.param.target,
            cmd.param.exp,
            cmd.param.storage,
        ]);
    }

    // raise a normal select
    static async Select() {
        var s = "";
        var n = 0;
        for (const d of this.SelectData) {
            s += n;
            s += d[0];
            s += '\n';
            n++;
        }
        var r = prompt(s, 0);
        var ro = this.SelectData[r];
        if (ro[2] !== undefined)
            TJSeval(ro[2], this);
        this.SelectData = [];
        return [ro[1], ro[3]];
    }

    static AddTrans(cmd) {

    }

    static CompileTrans(cmd) {
        this.inTrans = false;
    }

    // Experimental command parser prototype
    static UnpackCmd(cmd) {
        let { name, option, param } = cmd;
        let t = {};
        t[name] = ObjectMapper.TypeOf(name);
        option.forEach(element => {
            t[element] = ObjectMapper.TypeOf(element);
            if (t[element] === undefined) {
                if (["msgoff", "msgon", "se", "date", "wait", "stage",
                    "beginskip", "endskip", "fadepausebgm", "fadebgm",
                    "pausebgm", "resumebgm", "opmovie", "edmovie",
                    "initscene", "day_full", "ano_view", "ret_view",
                    "playbgm", "delaydone", "white_ball", "white_ball_hide", "particle",
                    "show", "hide", "eval", "newlay", "dellay", "bgm", "env", "ev", "date"]
                    .includes(element.toLowerCase())) t[element] = "command";
            }
        });
        //console.log(t);
    }

    static async Call(cmd) {
        this.UnpackCmd(cmd);
        // Always use arrow function, or Firefox will 'this is undefined'
        const callbacks = {
            "mselinit": () => this.MapSelectData = [],
            "mseladd": cmd => this.MapSelectAdd(cmd),
            "seladd": cmd => this.SelectAdd(cmd),
            "sysjump": cmd => console.debug("Sysjump, EOF?", cmd),
            "eval": cmd => TJSeval(cmd.param.exp, this),
            "begintrans": () => this.inTrans = true,
            "endtrans": cmd => this.CompileTrans(cmd),
            "newlay": cmd => YZCG.NewLay(cmd),
            "dellay": cmd => YZCG.DelLay(cmd),
            "bgm": cmd => YZSound.BGM(cmd),
            "env": cmd => YZBgImg.ProcessEnv(cmd),
            "ev": cmd => YZCG.EV(cmd),

            // macro, native impliement
            "opmovie": async () => await YZVideo.OP(),
            "edmovie": async cmd => await YZVideo.ED(cmd)
        }
        let callname = cmd.name.toLowerCase();
        let cb = callbacks[callname];
        if (cb !== undefined) {
            await cb(cmd);
        }
        else {
            // Jump unimpliement cmd
            if (["msgoff", "msgon", "se", "date", "wait", "stage",
                "beginskip", "endskip", "fadepausebgm", "fadebgm",
                "pausebgm", "resumebgm", "opmovie", "edmovie",
                "initscene", "day_full", "ano_view", "ret_view",
                "playbgm", "delaydone", "white_ball", "white_ball_hide", "particle"]
                .includes(cmd.name.toLowerCase())) return;

            let chobj = Character.characters[cmd.name];
            if (chobj !== undefined) {
                chobj.Process(cmd);
            }
            switch (ObjectMapper.TypeOf(cmd)) {
                case "characters":
                    Character.characters[cmd.name].Process(cmd);
                    break;
                case "times":
                    YZBgImg.SetDaytime(cmd.name);
                    break;
                case "stages":
                    YZBgImg.Process(cmd);
                    break;
                case "layer":
                    YZCG.LayerCtl(cmd);
                    break;
                default:
                    console.warn("RuntimeCall, unimpliement cmd", cmd);
                    break;
            }

            if (this.inTrans) {
                this.AddTrans(cmd);
            }
        }
    }
}

Runtime.Init();