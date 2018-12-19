// runtime libs
import Character from "./runtime/character";
import YZLayerHandler from "./runtime/layerhandler";
import YZSelect from "./runtime/select";
import TJSVM from "./tjsvm";
import YZSound from "./ui/sound";
import YZText from "./ui/text";
import YZVideo from "./ui/video";
import YZCamera from "./runtime/camera";

export default class Runtime {
    // Callback function map
    // Always use arrow function, or Firefox will 'this is undefined'
    private static callbacks: {
        [prop: string]: (a: KSFunc) => any
    } = {
            mseladd: cmd => YZSelect.MapSelectAdd(cmd),
            seladd: cmd => YZSelect.SelectAdd(cmd),
            next: cmd => YZSelect.Next(cmd),
            mselect: async cmd => YZSelect.MapSelect(),
            select: async cmd => YZSelect.Select(),
            bgm: cmd => YZSound.BGM(cmd),
            env: cmd => YZCamera.ProcessEnv(cmd),

            // has unexpected return value
            mselinit: () => YZSelect.MapSelectInit(),
            eval: cmd => { TJSVM.eval(cmd.param.exp as string); return undefined; },
            // macro, native impliement
            opmovie: async () => YZVideo.OP(),
            edmovie: async cmd => YZVideo.ED(cmd)
        };

    static Text(cmd: KSText) {
        const { text, name, display } = cmd;
        if (name) {
            const ch = Character.characters[name];
            Character.voiceBase = TJSVM.get("f.voiceBase");
            ch.Text(text, display);
        }
        else {
            YZText.Print(text, display);
        }
    }

    static async Call(cmd: KSFunc) {
        cmd.name = cmd.name.toLowerCase();
        const cb = this.callbacks[cmd.name];
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
