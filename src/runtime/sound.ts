import { LogLayerCmd } from "../debugtool";
import SLIParser from "../parser/sliparser";
import { GET } from "../utils/dom";
import FilePath from "../utils/filepath";
import SoundUI from "../ui/sound";

export default class Sound {
    static Process(cmd: KSFunc) {
        const { name, option, param } = cmd;
        let ch;
        switch (name) {
            case "se":
                LogLayerCmd("se", cmd);
                ch = SoundUI.Get(param.buf as string);
                break;
            case "bgm":
                LogLayerCmd("bgm", cmd);
                ch = SoundUI.Get("bgm");
                break;
            default:    // character voice pseudo command
                LogLayerCmd("voice", cmd);
                ch = SoundUI.Get(name);
                break;
        }
        if (option.includes("stop")) ch.Stop();
        if (param.storage) {
            let src = FilePath.findMedia(param.storage as string, "audio");
            if (!src) src = FilePath.find(param.storage as string);
            if (!src) debugger;

            const filename = src.match(/^\/?(.+\/)*(.+)/)[2];
            const sli = FilePath.find(filename + ".sli");
            if (sli) {
                this.parseSLI(sli);
            }
            ch.Src(src);
            ch.Play();
        }
    }

    static async parseSLI(file: string) {
        const str = await GET(file);
        const data = SLIParser.parse(str);
        // 100000 unit = 2.2s
        // TODO: Okay, apply it to real channel
    }

    static setJump(channel: string, jump: SLILink) {
        const rate = 2.2 / 100000;
        const from = jump.from * rate;
        const to = jump.to * rate;
        const ch = SoundUI.Get(channel);
    }
}
