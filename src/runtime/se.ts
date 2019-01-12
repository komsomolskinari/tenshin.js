import FilePath from "../utils/filepath";
import * as $ from "jquery";

export default class SoundEffect {
    private static basedom: JQuery<HTMLElement>;
    static Init() {
        this.basedom = $("#audiodiv");
    }
    private static channels: {
        [name: string]: JQuery<HTMLAudioElement>
    } = {};
    static Process(cmd: KSFunc) {
        const { name, option, param } = cmd;
        if (name !== "se") return; // for future bgm and other cmd
        const ch = this.getChannel(param.buf as string);
        if (option.includes("stop")) ch[0].pause();
        if (param.storage) {
            const src = FilePath.find(param.storage as string);
            if (!src) debugger;
            ch.attr("src", src);
            ch[0].play().catch(e => { return undefined; });
        }
    }

    static getChannel(ch: string) {
        if (!this.channels.ch) {
            this.basedom.append(
                $("<audio>").attr("id", `se_${ch}`)
            );
            this.channels.ch = $(`#se_${ch}`);
        }
        return this.channels.ch;
    }
}