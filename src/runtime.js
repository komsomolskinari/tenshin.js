// runtime libs
import Character from './runtime/character';
import ObjectMapper from './objectmapper';
import TJSVM from './tjsvm';
import YZBgImg from './runtime/bgimg';
import YZCG from './runtime/cg';
import YZSound from './ui/sound';
import YZText from './ui/text';
import YZVideo from './ui/video';
import YZSelect from './runtime/select';

export default class Runtime {
    static Init() {
        // Callback function map
        // Always use arrow function, or Firefox will 'this is undefined'
        this.callbacks = {
            "mseladd": cmd => YZSelect.MapSelectAdd(cmd),
            "seladd": cmd => YZSelect.SelectAdd(cmd),
            "next": cmd => YZSelect.Next(cmd),
            "mselect": async cmd => await YZSelect.MapSelect(cmd),
            "select": async cmd => await YZSelect.Select(cmd),
            "sysjump": cmd => console.debug("Sysjump, EOF?", cmd),
            //"endtrans": cmd => this.CompileTrans(cmd),
            "newlay": cmd => YZCG.NewLay(cmd),
            "dellay": cmd => YZCG.DelLay(cmd),
            "bgm": cmd => YZSound.BGM(cmd),
            "env": cmd => YZBgImg.ProcessEnv(cmd),
            "ev": cmd => YZCG.EV(cmd),

            // has unexpected return value
            "mselinit": () => { this.MapSelectData = []; return undefined },
            "eval": cmd => { TJSVM.eval(cmd.param.exp); return undefined },
            //"begintrans": () => { this.inTrans = true; return undefined },

            // macro, native impliement
            "opmovie": async () => await YZVideo.OP(),
            "edmovie": async cmd => await YZVideo.ED(cmd)
        }
    }

    // Text related commands
    // 
    static Text(cmd) {
        let { text, name, display } = cmd;
        if (name) {
            let ch = Character.characters[name];
            Character.voiceBase = TJSVM.get('f.voiceBase');
            ch.Text(text, display);
        }
        else {
            YZText.Print(text, display);
        }
    }

    static async Call(cmd) {
        let callname = cmd.name.toLowerCase();
        let cb = this.callbacks[callname];
        let ret;
        if (cb !== undefined) {
            // don't rewrite 'this' here
            ret = await cb(cmd);
        }
        else {
            // Jump unimpliement cmd
            if (["msgoff", "msgon", "se", "date", "wait", "stage",
                "beginskip", "endskip", "fadepausebgm", "fadebgm",
                "pausebgm", "resumebgm", "opmovie", "edmovie",
                "initscene", "day_full", "ano_view", "ret_view",
                "playbgm", "delaydone", "white_ball", "white_ball_hide", "particle"]
                .includes(cmd.name.toLowerCase())) return;

            /*let chobj = Character.characters[cmd.name];
            if (chobj !== undefined) {
                chobj.Process(cmd);
            }*/
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
                    YZCG.ProcessLay(cmd);
                    break;
                default:
                    console.warn("RuntimeCall, unimpliement cmd", cmd);
                    break;
            }
        }
        return ret;
    }
}

Runtime.Init();