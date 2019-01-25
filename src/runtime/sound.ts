import { LogLayerCmd } from "../debugtool";
import SLIParser from "../parser/sliparser";
import SoundUI from "../ui/sound";
import { GET } from "../utils/dom";
import FilePath from "../utils/filepath";

export default class Sound {
    static async Process(cmd: KSFunc) {
        const { name, option, param } = cmd;
        let ch: SoundUI;
        switch (name) {
            case "se":
                LogLayerCmd("se", cmd);
                ch = SoundUI.Get(param.buf);
                break;
            case "bgm":
                LogLayerCmd("bgm", cmd);
                ch = SoundUI.Get("bgm");
                break;
            default:    // character voice pseudo command
                LogLayerCmd("voice", cmd);
                ch = SoundUI.Get(name, "voice");
                break;
        }
        if (option.includes("stop")) ch.Stop();
        if (param.storage) {
            let src = FilePath.findByType(param.storage, "audio");
            if (!src) src = FilePath.find(param.storage);
            if (!src) debugger;

            const filename = src.match(/^\/?(.+\/)*(.+)/)[2];
            const sli = FilePath.find(filename + ".sli");
            ch.Src(src);
            if (sli) {

                const str = await GET(sli);
                const data = SLIParser.parse(str);
                const rate = 2.23 / 100000; // I'm not sure, 2.23 works for me

                data.forEach(d => {
                    switch (d.type) {
                        case "link":
                            ch.Link(d.from * rate, d.to * rate);
                            break;
                        case "label":
                            ch.Label(d.position * rate, d.name);
                            break;
                    }
                });
                if (param.start !== undefined) ch.StartAt(param.start);
            }
            ch.Play();
        }
    }
}
