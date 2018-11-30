import FilePath from "../utils/filepath";

export default class YZVideo {
    static Init() {
        this.vfd = $('#video');
    }

    // all HW implement
    static async OP() {
        //Unicode 万国码
        await this.Play(Config.Display.OPFile);
    }
    static async ED(cmd) {
        await this.Play(cmd.param.file);
    }

    static async Play(src) {
        this.vfd.attr('src', FilePath.findMedia(src, 'video'));

        let pm = new Promise((resolve, reject) => {
            this.vfd.one('ended', () => resolve());
            $(document).one('click', () => resolve());
        });
        this.vfd.get(0).play();
        await pm;
        this.vfd.get(0).pause();
        this.vfd.attr('src', '');
    }
}