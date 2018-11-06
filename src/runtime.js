// runtime libs
import ObjectMapper from './objmapper';
import TJSeval from './utils/tjseval';
import YZSound from './ui/sound';
import Character from './character';
import TextHTML from './utils/texthtml';

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
        var info = ObjectMapper.GetNameInfo(name);

        if (name) {
            let ch = Character.characters[name];
            // display name haven't been rewrite, need set
            if (display == null) {
                if (info.name != null) display = ch.displayName;
                else display = cmd.name;
            }
            Character.voiceBase = this.TJSvar['f.voiceBase'];
            ch.Voice();
        }
        $('#charname').html(display);
        $('#chartxt').html(TextHTML(text));
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
    static MapSelect() {
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
    static Select() {
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

    static Call(cmd) {
        switch (cmd.name) {
            case "mselinit":
                this.MapSelectData = [];
                break;
            case "mseladd":
                this.MapSelectAdd(cmd);
                break;
            case "seladd":
                this.SelectAdd(cmd);
                break;
            case "sysjump":
                console.debug("Sysjump, EOF?", cmd);
                break;
            case "eval":
                TJSeval(cmd.param.exp, this);
                break;
            case "begintrans":
                this.inTrans = true;
                break;
            case "endtrans":
                this.CompileTrans(cmd);
                break;
            case "newlay":
                ObjectMapper.NewLay(cmd);
                break;
            case "dellay":
                ObjectMapper.DelLay(cmd);
                break;
            case "bgm":
                YZSound.BGM(cmd);
                break;
            default:
                // Jump unimpliement cmd
                if (["ev", "msgoff", "msgon", "se", "env", "date", "wait", "stage",
                    "beginskip", "endskip", "fadepausebgm", "fadebgm", "pausebgm", "resumebgm", "opmovie", "edmovie",
                    "initscene", "day_full", "ano_view", "ret_view", "playbgm", "delaydone", "white_ball", "white_ball_hide", "particle"].includes(cmd.name.toLowerCase())) break;

                let chobj = Character.characters[cmd.name];
                if (chobj !== undefined) {
                    chobj.Process(cmd);
                }

                if (this.inTrans) {
                    this.AddTrans(cmd);
                }
                if (!ObjectMapper.HaveObject(cmd.name))
                    console.warn("RuntimeCall, unimpliement cmd", cmd);
                break;
        }
    }
}
Runtime.Init();