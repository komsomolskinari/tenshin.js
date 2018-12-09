import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";
import YZLayerMgr from "../ui/layer";

export default class YZBgImg {
    static daytime: any = undefined;
    static stage: any = undefined;
    static curImg = "";
    static bgname = "background";
    static camfd = $("#camera");

    static Init() {
        this.daytime = undefined;
        this.stage = undefined;
        this.curImg = "";
        this.bgname = "background";
        // this.bgfd = $('#bgimg');
        this.camfd = $("#camera");
    }

    static SetDaytime(time: any) {
        if (ObjectMapper.TypeOf(time) === "times") {
            this.daytime = ObjectMapper.GetProperty(time);
        }
    }

    static Process(cmd: KSLine) {
        const { name, option, param } = cmd;
        this.stage = ObjectMapper.GetProperty(name);

        // inline time
        const inlineTime = (option.filter(o => ObjectMapper.TypeOf(o as string) === "times") || [])[0];
        if (inlineTime) {
            this.SetDaytime(inlineTime);
        }

        this.curImg = this.stage.image.replace("TIME", this.daytime.prefix);
        YZLayerMgr.Set(this.bgname, [{ name: this.curImg }], "stages");
        YZLayerMgr.Move(this.bgname, { x: 0, y: 0 });
        YZLayerMgr.Zoom(this.bgname, 100);
        const xpos = param.xpos as number || 0;
        const ypos = param.ypos as number || 0;
        const zoom = param.zoom as number || 100;
        YZLayerMgr.Move(this.bgname, { x: xpos, y: ypos });
        YZLayerMgr.Zoom(this.bgname, zoom);
        YZLayerMgr.Draw(this.bgname);
        return { name: this.bgname, layer: [{ name: this.curImg }] };
    }

    static ProcessEnv(cmd: KSLine) {
        const { name, option, param } = cmd;
        if (option.includes("resetcamera")) {
            // reset and return
            this.SetEnvZoom(100, 0, 0);
            return;
        }

        const cx = param.camerax as number || 0;
        const cy = param.cameray as number || 0;
        const zoom = param.camerazoom as number || 100;
        this.SetEnvZoom(zoom, cx, cy);
    }

    static SetEnvZoom(zoom: number, x: number, y: number) {
        this.camfd
            // horizontal axis is reversed
            .css("left", -x * 0.3)
            .css("top", y * 0.3)
            .css("transform", `scale(${zoom / 100})`)
            .css("transform-origin", "50% 50% 0px");
    }
}
