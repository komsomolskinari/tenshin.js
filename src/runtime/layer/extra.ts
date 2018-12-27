import LayerBase from "./base";
import ObjectMapper from "../../objectmapper";
import YZLayer from "../../ui/layer";
export default class LayerExtra extends LayerBase {
    positionZoom = 1;
    public static Init() {
        return;
    }
    public static GetInstance(cmd?: KSFunc): LayerExtra {
        if (this.instance === undefined) {
            this.instance = new LayerExtra();
        }
        return this.instance;
    }
    private static instance: LayerExtra = undefined;

    private cgName = "";
    private daytime: any = undefined;
    private stage: any = undefined;
    readonly channelName = "background";
    CalculateSubLayer(cmd: KSFunc): LayerControlData {
        switch (cmd.name) {
            case "newlay":
                const { name, option, param } = cmd;
                const lname = param.name as string;
                const lfile = param.file as string;
                if (!lfile) { return; }
                ObjectMapper.AddLayer(lname);
                return { name: lname, layer: [{ name: lfile }] };
            case "dellay":
                YZLayer.Unset(cmd.param.name as string);
                ObjectMapper.RemoveLayer(cmd.param.name as string);
                return undefined;
            case "ev":
            default:
                return { name: cmd.name, layer: [] };
        }
    }
}
