import { getElem, removeThisListener } from "../utils/dom";
import FilePath from "../utils/filepath";

export default class VideoUI {
    static vfd: HTMLVideoElement;

    static Init() {
        this.vfd = getElem("#video") as HTMLVideoElement;
    }

    // all HW implement
    static async OP() {
        await this.Play(Config.Display.OPFile);
    }
    static async ED(cmd: KSFunc) {
        await this.Play(cmd.param.file);
    }

    static async Play(src: string) {
        this.vfd.src = FilePath.findMedia(src, "video");

        const pm = new Promise((resolve, reject) => {
            const cb = (e: Event) => {
                removeThisListener(e, cb);
                resolve();
            };
            this.vfd.addEventListener("ended", cb);
        });
        this.vfd.play();
        await pm;
        this.vfd.pause();
        this.vfd.src = "";
    }
}
