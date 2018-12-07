import FilePath from "../utils/filepath";

export default class YZVideo {
    static vfd: JQuery<HTMLElement>;

    static Init() {
        this.vfd = $("#video");
    }

    // all HW implement
    static async OP() {
        await this.Play(Config.Display.OPFile);
    }
    static async ED(cmd: KSLine) {
        await this.Play(cmd.param.file as string);
    }

    static async Play(src: string) {
        this.vfd.attr("src", FilePath.findMedia(src, "video"));

        const pm = new Promise((resolve, reject) => {
            this.vfd.one("ended", () => resolve());
            $(document).one("click", () => resolve());
        });
        const elm = this.vfd.get(0) as HTMLAudioElement;
        elm.play();
        await pm;
        elm.pause();
        this.vfd.attr("src", "");
    }
}