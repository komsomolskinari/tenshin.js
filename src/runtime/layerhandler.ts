import ObjectMapper from "../objectmapper";
import YZLayer from "../ui/layer";
import KSParser from "../utils/ksparser";
import LayerBase from "./layer/base";
import LayerBG from "./layer/bg";
import LayerChara from "./layer/chara";
import LayerExtra from "./layer/extra";
import LayerEV from "./layer/ev";

export default class LayerHandler {
    static isLayer(cmd: KSLine) {
        // hack for newlay & dellay
        if (["newlay", "dellay", "ev"].includes(cmd.name)) return true;
        return ["characters", "times", "stages", "layer"]
            .includes(ObjectMapper.TypeOf(cmd.name));
    }

    // layerhandler
    static Process(cmd: KSFunc) {
        const instance = this.GetLayerInstance(cmd);
        const controlData = instance.CalculateSubLayer(cmd);
        if (controlData === undefined) return;
        const name = controlData.name;
        const reload = controlData.reload;
        const position = instance.CalculatePosition(cmd);
        const zoom = instance.CalculateZoom(cmd);
        const show = instance.CalculateShowHide(cmd);
        const zindex = instance.zindex;
        if (reload) YZLayer.Unset(name);
        const layer = YZLayer.Set(name, controlData.layer, zindex);
        layer.Move(position);
        layer.Zoom(zoom);
        if (show === true) layer.Show();
        else if (show === false) layer.Hide();
        layer.Draw();
        layer.Trace(KSParser.stringify([cmd]));
        return;
    }

    static GetLayerInstance(cmd: KSFunc): LayerBase {
        let cb: typeof LayerBase;
        // if cant get type, use name instead
        const layerType = ObjectMapper.TypeOf(cmd.name) || cmd.name;
        switch (layerType) {
            case "times":
            case "stages":
                cb = LayerBG;
                break;
            case "characters":
                cb = LayerChara;
                break;
            case "layer":
            case "newlay":
            case "dellay":
                cb = LayerExtra;
                break;
            case "ev":
                cb = LayerEV;
                break;
            default:
                cb = LayerBase;
                break;
        }
        return cb.GetInstance(cmd);
    }
}
