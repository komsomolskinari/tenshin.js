import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";

export default class YZBgImg {
    static Init() {
        this.daytime = undefined;
        this.stage = undefined;
        this.curImg = "";
        this.imageFormat = ".png";
        this.bgfd = $('#bgimg');
        this.camfd = $('#camera');
    }

    static SetDaytime(time) {
        if (ObjectMapper.TypeOf(time) == "times")
            this.daytime = ObjectMapper.GetProperty(time);
    }

    static Process(cmd) {
        let { name, option, param } = cmd;
        this.stage = ObjectMapper.GetProperty(name);

        // inline time
        let inlineTime = (option.filter(o => ObjectMapper.TypeOf(o) == "times") || [])[0];
        if (inlineTime) {
            this.SetDaytime(inlineTime);
        }

        this.curImg = this.stage.image.replace('TIME', this.daytime.prefix);
        let bgPath = FilePath.find(this.curImg + this.imageFormat);
        this.bgfd.attr('src', bgPath);
        this.Reset();
        let mapped = {};
        option.filter(o => ObjectMapper.IsProperty(o)).forEach(o => {
            let t = ObjectMapper.TypeOf(o);
            if (mapped[t] === undefined) mapped[t] = [];
            let mo = ObjectMapper.GetProperty(o);
            if (mo.length === undefined) {
                mapped[t].push(mo);
            }
            else {
                for (const i of mo) {
                    mapped[t].push(i);
                }
            }
        });

        let xpos = param.xpos || 0;
        let ypos = param.ypos || 0;
        let zoom = param.zoom || 100;
        this.SetZoom(zoom, xpos, ypos);

        let blur = param.blur || null;
        this.SetBlur(blur);
    }

    static async SetZoom(zoom, x, y) {
        let rzoom = zoom / 100;
        let origx = parseInt(this.bgfd.get(0).naturalWidth);
        let origy = parseInt(this.bgfd.get(0).naturalHeight);
        // not loaded
        if (origx + origy <= 0) {
            // wait image loaded
            await new Promise((resolve, reject) => {
                this.bgfd.on('load', () => resolve());
                this.bgfd.on('error', () => reject());
            })
            origx = parseInt(this.bgfd.get(0).naturalWidth);
            origy = parseInt(this.bgfd.get(0).naturalHeight);
        }

        let [curx, cury] = [origx * rzoom, origy * rzoom]
        let [cx, cy] = [curx / 2, cury / 2];
        let [offx, offy] = [640 - cx, 360 - cy];
        [offx, offy] = [offx - x / 10, offy - y / 10];
        this.bgfd
            .css('width', curx)
            .css('height', cury)
            .css('left', offx)
            .css('top', offy)

            // remove listener, prepare for next call
            .off('load')
            .off('error')
    }

    static SetBlur(blur) {
        if (!blur) this.bgfd.css('filter', '');
        else this.bgfd.css('filter', `blur(${blur}px)`);
    }

    static Reset() {
        this.SetBlur(null);
        this.SetZoom(100, 0, 0);
    }

    static ProcessEnv(cmd) {
        let { name, option, param } = cmd;
        if (option.includes("resetcamera")) {
            // reset and return
            this.SetEnvZoom(100, 0, 0);
            return;
        }

        let cx = parseInt(param.camerax || 0);
        let cy = parseInt(param.cameray || 0);
        let zoom = parseInt(param.camerazoom || 100);
        this.SetEnvZoom(zoom, cx, cy);
    }

    static SetEnvZoom(zoom, x, y) {
        this.camfd
            // horizontal axis is reversed
            .css('left', -x * 0.3)
            .css('top', y * 0.3)
            .css('transform', `scale(${zoom / 100})`)
            .css('transform-origin', '50% 50% 0px')
    }
}
