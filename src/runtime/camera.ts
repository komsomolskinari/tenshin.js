export default class YZCamera {
    private static camfd = $("#camera");

    public static Init() {
        this.camfd = $("#camera");
    }

    public static ProcessEnv(cmd: KSLine) {
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

    private static SetEnvZoom(zoom: number, x: number, y: number) {
        this.camfd
            // horizontal axis is reversed
            .css("left", -x * 0.3)
            .css("top", y * 0.3)
            .css("transform", `scale(${zoom / 100})`)
            .css("transform-origin", "50% 50% 0px");
    }
}