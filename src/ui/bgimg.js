import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";

export default class YZBgImg {
    static Init() {
        this.daytime = undefined;
        this.stage = undefined;
        this.curImg = "";
        this.imageFormat = ".png"
        this.bgfd = $('#bgimg');
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

    static SetZoom(zoom, x, y) {
        this.bgfd.on('load', () => {
            let rzoom = zoom / 100;
            let origx = parseInt(this.bgfd.get(0).naturalWidth);
            let origy = parseInt(this.bgfd.get(0).naturalHeight);
            let [curx, cury] = [origx * rzoom, origy * rzoom]
            let [cx, cy] = [curx / 2, cury / 2];
            let [offx, offy] = [640 - cx, 360 - cy];
            [offx, offy] = [offx - x / 10, offy - y / 10];
            this.bgfd
                .css('width', curx)
                .css('height', cury)
                .css('left', offx)
                .css('top', offy)
        })
    }

    static SetBlur(blur) {
        if (!blur) this.bgfd.css('filter', '');
        else this.bgfd.css('filter', `blur(${blur}px)`);
    }

    static Reset() {
        this.SetBlur(null);
        this.SetZoom(100, 0, 0);
    }
}