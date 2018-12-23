import { KAGConst } from "../const";
import ObjectMapper from "../objectmapper";
import YZLayer from "../ui/layer";
import KSParser from "../utils/ksparser";
import YZCG from "./cg";
import Character from "./character";

export default class YZLayerHandler {
    static isLayer(cmd: KSLine) {
        // hack for newlay & dellay
        if (["newlay", "dellay", "ev"].includes(cmd.name)) return true;
        return ["characters", "times", "stages", "layer"]
            .includes(ObjectMapper.TypeOf(cmd.name));
    }

    // layerhandler
    static Process(cmd: KSFunc) {
        const controlData = this.CalculateSubLayer(cmd);
        if (controlData === undefined) return;
        const name = controlData.name;
        const reload = controlData.reload;
        const position = this.CalculatePosition(cmd);
        const zoom = this.CalculateZoom(cmd);
        const show = this.CalculateShow(cmd);
        if (reload) YZLayer.Unset(name);
        const layerType = ObjectMapper.TypeOf(cmd.name);
        const layer = YZLayer.Set(name, controlData.layer, layerType);
        layer.Move(position);
        layer.Zoom(zoom);
        if (show === true) layer.Show();
        else if (show === false) layer.Hide();
        layer.Draw();
        layer.Trace(KSParser.stringify([cmd]));
        return;
    }

    static CalculateSubLayer(cmd: KSFunc): LayerControlData {
        let cb: (cmd?: KSFunc) => LayerControlData = () => { return undefined; };
        const layerType = ObjectMapper.TypeOf(cmd.name);
        switch (layerType) {
            case "characters":
                cb = (cmd) => Character.ProcessImage(cmd);
                break;
            case "times":
                cb = (cmd) => YZCG.SetDaytime(cmd.name);
                break;
            case "stages":
                cb = (cmd) => YZCG.ProcessBG(cmd);
                break;
            case "layer":
                cb = (cmd) => ({ name: cmd.name, layer: [] });
                break;
            default:
                switch (cmd.name) {
                    case "newlay":
                        cb = (cmd) => YZCG.NewLay(cmd);
                        break;
                    case "dellay":
                        cb = (cmd) => YZCG.DelLay(cmd);
                        break;
                    case "ev":
                        cb = (cmd) => YZCG.ProcessEV(cmd);
                        break;
                }
        }
        return cb(cmd);
    }

    static CalculatePosition(cmd: KSFunc): Point {
        // xpos and ypos will cover other value
        const { name, option, param } = cmd;
        // direct reset
        if (option.includes("reset") || option.includes("resetpos")) return { x: 0, y: 0 };

        const mapped = ObjectMapper.ConvertAll(option);
        const mapX = ((mapped.positions || [])
            .filter((p: any) => p.xpos !== undefined)
            .map((p: any) => p.xpos)[0])
            || undefined;
        // type sensitive
        const paramX = (param.xpos !== undefined) ? parseInt(param.xpos as string) : undefined;
        const paramY = (param.ypos !== undefined) ? parseInt(param.ypos as string) : undefined;

        const finalX = parseInt(mapX) || paramX;
        const finalY = paramY;
        return { x: finalX, y: finalY as number };
    }

    static CalculateZoom(cmd: KSFunc): number {
        const { name, option, param } = cmd;
        if (option.includes("reset")) return 100;
        const mapped = ObjectMapper.ConvertAll(option);
        const mapZoomLevel = ((mapped.positions || [])
            .filter((p: any) => p.level !== undefined)
            .map((p: any) => p.level)[0])
            || undefined;
        const mapZoom = (mapZoomLevel === undefined) ? undefined : ObjectMapper.innerobj.levels[mapZoomLevel].imgzoom;
        const paramZoom = (param.zoom !== undefined) ? parseInt(param.zoom as string) : undefined;
        const finalZoom = parseInt(mapZoom) || paramZoom;
        return finalZoom;
    }

    static CalculateShow(cmd: KSFunc): boolean {
        const { name, option, param } = cmd;
        let needShow;
        if (option.includes("show")) needShow = true;
        if (option.includes("hide")) needShow = false;
        const mapped = ObjectMapper.ConvertAll(option);
        const mapShowOpt = ((mapped.positions || [])
            .filter((p: any) => p.disp !== undefined)
            .map((p: any) => p.disp)[0])
            || undefined;
        let mapShow;
        if (mapShowOpt !== undefined) {
            if ([KAGConst.Both, KAGConst.BU].includes(mapShowOpt)) mapShow = true;
            else mapShow = false;
        }
        needShow = (needShow === undefined) ? mapShow : needShow;
        return needShow;
    }
}
