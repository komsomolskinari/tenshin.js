import { LogLayerCmd } from "../debugtool";
import FilePath from "../utils/filepath";
import SLIParser from "../utils/sliparser";
import { GET, getElem } from "../utils/util";

export default class Sound {
    private static basedom: HTMLElement;
    static Init() {
        this.basedom = getElem("#audiodiv");
        this.channels.bgm = getElem("#snd_bgm") as HTMLAudioElement;
    }
    private static channels: {
        [name: string]: HTMLAudioElement
    } = {};
    static Process(cmd: KSFunc) {
        const { name, option, param } = cmd;
        let ch;
        switch (name) {
            case "se":
                LogLayerCmd("se", cmd);
                ch = this.getChannel(param.buf as string);
                break;
            case "bgm":
                LogLayerCmd("bgm", cmd);
                ch = this.getChannel("bgm");
                break;
            default:    // character voice pseudo command
                LogLayerCmd("voice", cmd);
                ch = this.getChannel(name);
                break;
        }
        if (option.includes("stop")) ch.pause();
        if (param.storage) {
            let src = FilePath.findMedia(param.storage as string, "audio");
            if (!src) src = FilePath.find(param.storage as string);
            if (!src) debugger;

            const filename = src.match(/^\/?(.+\/)*(.+)/)[2];
            const sli = FilePath.find(filename + ".sli");
            if (sli) {
                this.parseSLI(sli);
            }
            ch.src = src;
            ch.play().catch(e => { return undefined; });
        }
    }

    static getChannel(ch: string) {
        if (!this.channels[ch]) {
            const elem = document.createElement("audio");
            elem.id = `snd_${ch}`;
            this.basedom.appendChild(elem);
            this.channels[ch] = elem;
        }
        return this.channels[ch];
    }

    static async parseSLI(file: string) {
        const str = await GET(file);
        const data = SLIParser.parse(str);
        // TODO: Okay, apply it to real channel
    }
}
