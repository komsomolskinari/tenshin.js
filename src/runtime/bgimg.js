import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";
import YZLayerMgr from "../ui/layer";

export default class YZBgImg {
    static Init() {
        this.daytime = undefined;
        this.stage = undefined;
        this.curImg = "";
        this.bgname = "background";
        //this.bgfd = $('#bgimg');
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
        YZLayerMgr.Set(this.bgname, [{ name: this.curImg }], "stages");
        YZLayerMgr.Move(this.bgname, 0, 0);
        YZLayerMgr.Zoom(this.bgname, 100);
        let xpos = param.xpos || 0;
        let ypos = param.ypos || 0;
        let zoom = param.zoom || 100;
        YZLayerMgr.Move(this.bgname, xpos, ypos);
        YZLayerMgr.Zoom(this.bgname, zoom);
        YZLayerMgr.Draw(this.bgname);
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
