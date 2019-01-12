import ObjectMapper from "../objectmapper";
import LayerBase from "./layer/base";
import LayerBG from "./layer/bg";
import LayerChara from "./layer/chara";
import LayerExtra from "./layer/extra";
import LayerEV from "./layer/ev";
import { LogLayerCmd } from "../debugtool";
import LayerCamera from "./layer/camera";
import YZLayerMgr from "../ui/layermgr";

export default class LayerHandler {
    static isLayer(cmd: KSLine) {
        // hack for newlay & dellay
        if (["newlay", "dellay", "ev", "env"].includes(cmd.name)) return true;
        return ["characters", "times", "stages", "layer"]
            .includes(ObjectMapper.TypeOf(cmd.name));
    }

    // layerhandler
    static Process(cmd: KSFunc) {
        const instance = this.GetLayerInstance(cmd);
        const controlData = instance.CalculateSubLayer(cmd);
        if (controlData === undefined) return;
        const name = instance.CalculateName(cmd);
        const reload = instance.CalculateReload(cmd);
        const position = instance.CalculatePosition(cmd);
        const zoom = instance.CalculateZoom(cmd);
        const show = instance.CalculateShowHide(cmd);
        const zindex = instance.zindex;
        const size = instance.CalculateSize(cmd);
        const center = instance.CalculateZoomCenter(cmd);
        if (reload) YZLayerMgr.Unset(name);
        const layer = YZLayerMgr.Set(name, controlData, zindex);
        layer.Move(position);
        layer.Zoom(zoom);
        layer.SetZoomCenter(center);
        if (size) layer.SetSize(size);
        if (show === true) layer.Show();
        else if (show === false) layer.Hide();
        layer.Draw();
        LogLayerCmd(name, cmd);
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
            case "env":
                cb = LayerCamera;
                break;
            default:
                cb = LayerBase;
                break;
        }
        return cb.GetInstance(cmd);
    }
}
