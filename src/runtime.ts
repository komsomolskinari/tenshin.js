// runtime libs
import Character from './runtime/character';
import TJSVM from './tjsvm';
import YZBgImg from './runtime/bgimg';
import YZCG from './runtime/cg';
import YZSound from './ui/sound';
import YZText from './ui/text';
import YZVideo from './ui/video';
import YZSelect from './runtime/select';
import YZLayerHandler from './runtime/layerhandler';

export default class Runtime {
    // Callback function map
    // Always use arrow function, or Firefox will 'this is undefined'
    static callbacks: {
        [prop: string]: (a: KSLine) => any
    } = {
            "mseladd": cmd => YZSelect.MapSelectAdd(cmd),
            "seladd": cmd => YZSelect.SelectAdd(cmd),
            "next": cmd => YZSelect.Next(cmd),
            "mselect": async cmd => await YZSelect.MapSelect(),
            "select": async cmd => await YZSelect.Select(),
            "sysjump": cmd => console.debug("Sysjump, EOF?", cmd),
            //"endtrans": cmd => this.CompileTrans(cmd),
            "newlay": cmd => YZCG.NewLay(cmd),
            "dellay": cmd => YZCG.DelLay(cmd),
            "bgm": cmd => YZSound.BGM(cmd),
            "env": cmd => YZBgImg.ProcessEnv(cmd),
            "ev": cmd => YZCG.EV(cmd),

            // has unexpected return value
            "mselinit": () => YZSelect.MapSelectInit(),
            "eval": cmd => { TJSVM.eval(cmd.param.exp as string); return undefined },
            //"begintrans": () => { this.inTrans = true; return undefined },

            // macro, native impliement
            "opmovie": async () => await YZVideo.OP(),
            "edmovie": async cmd => await YZVideo.ED(cmd)
        }


    // Text related commands
    // 
    static Text(cmd: KSLine) {
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

    static async Call(cmd: KSLine) {
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

            if (YZLayerHandler.isLayer(cmd)) YZLayerHandler.Process(cmd);
            else console.warn("RuntimeCall, unimpliement cmd", cmd);
        }
        return ret;
    }
}