import * as $ from "jquery";
import { LogLayerCmd } from "../debugtool";
import FilePath from "../utils/filepath";
import SLIParser from "../utils/sliparser";
import { AJAX } from "../utils/util";

export default class Sound {
    private static basedom: JQuery<HTMLElement>;
    static Init() {
        this.basedom = $("#audiodiv");
        this.channels.bgm = $("#snd_bgm");
    }
    private static channels: {
        [name: string]: JQuery<HTMLAudioElement>
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
        if (option.includes("stop")) ch[0].pause();
        if (param.storage) {
            let src = FilePath.findMedia(param.storage as string, "audio");
            if (!src) src = FilePath.find(param.storage as string);
            if (!src) debugger;

            const filename = src.match(/^\/?(.+\/)*(.+)/)[2];
            const sli = FilePath.find(filename + ".sli");
            if (sli) {
                this.parseSLI(sli);
            }
            ch.attr("src", src);
            ch[0].play().catch(e => { return undefined; });
        }
    }

    static getChannel(ch: string) {
        if (!this.channels[ch]) {
            this.basedom.append(
                $("<audio>").attr("id", `snd_${ch}`)
            );
            this.channels[ch] = $(`#snd_${ch}`);
        }
        return this.channels[ch];
    }

    static async parseSLI(file: string) {
        const str = await AJAX(file);
        const data = SLIParser.parse(str);
        // TODO: Okay, apply it to real channel
    }
}
