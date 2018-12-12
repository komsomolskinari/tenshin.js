import ObjectMapper from "../objectmapper";
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

    static SetDaytime(time: any): LayerControlData {
        if (ObjectMapper.TypeOf(time) === "times") {
            this.daytime = ObjectMapper.GetProperty(time);
        }
        return { name: this.bgname, layer: [] };
    }

    static Process(cmd: KSLine): LayerControlData {
        const { name, option, param } = cmd;
        this.stage = ObjectMapper.GetProperty(name);

        // inline time
        const inlineTime = (option.filter(o => ObjectMapper.TypeOf(o as string) === "times") || [])[0];
        if (inlineTime) {
            this.SetDaytime(inlineTime);
        }

        this.curImg = this.stage.image.replace("TIME", this.daytime.prefix);
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
