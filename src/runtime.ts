// runtime libs
import LayerChara from "./runtime/layer/chara";
import LayerHandler from "./runtime/layerhandler";
import YZSelect from "./runtime/select";
import Sound from "./runtime/sound";
import TJSVM from "./tjsvm";
import YZText from "./ui/text";
import YZVideo from "./ui/video";
export default class Runtime {
    // Callback function map
    // Always use arrow function, or Firefox will 'this is undefined'
    private static callbacks: {
        [prop: string]: (a: KSFunc) => JumpDest | void | Promise<JumpDest | void>
    } = {
            mselinit: () => YZSelect.MapSelectInit(),
            mseladd: cmd => YZSelect.MapSelectAdd(cmd),
            mselect: async cmd => YZSelect.MapSelect(),
            select: async cmd => YZSelect.Select(),
            seladd: cmd => YZSelect.SelectAdd(cmd),
            next: cmd => YZSelect.Next(cmd),
            bgm: cmd => Sound.Process(cmd),
            eval: cmd => { TJSVM.eval(cmd.param.exp as string); return undefined; },
            // macro, native impliement
            opmovie: async () => YZVideo.OP(),
            edmovie: async cmd => YZVideo.ED(cmd),
            se: cmd => Sound.Process(cmd)
        };

    static Text(cmd: KSText) {
        const { text, name, display } = cmd;
        if (name) {
            LayerChara.voiceBase = TJSVM.get("f.voiceBase");
            LayerChara.GetInstance({ name } as KSFunc).Text(text, display);
        }
        else {
            YZText.Print(text, display);
        }
    }

    static async Call(cmd: KSFunc): Promise<JumpDest> {
        cmd.name = cmd.name.toLowerCase();
        const cb = this.callbacks[cmd.name];
        let ret;
        if (cb !== undefined) {
            // don't rewrite 'this' here
            ret = await cb(cmd);
        }
        else {
            // Jump unimpliement cmd
            if (["msgoff", "msgon", "date", "wait", "stage",
                "beginskip", "endskip", "fadepausebgm", "fadebgm",
                "pausebgm", "resumebgm", "opmovie", "edmovie",
                "initscene", "day_full", "ano_view", "ret_view",
                "playbgm", "delaydone", "white_ball", "white_ball_hide", "particle"]
                .includes(cmd.name.toLowerCase())) return;

            if (LayerHandler.isLayer(cmd)) LayerHandler.Process(cmd);
            else console.warn("RuntimeCall, unimpliement cmd", cmd);
        }
        if (!ret) return undefined;
        return ret;
    }
}
