import ObjectMapper from "../objectmapper";
import Character from "./character";
import YZCG from "./cg";
import YZLayerMgr from "../ui/layer";
import { KAGConst } from "../const";

export default class YZLayerHandler {
    static isLayer(cmd: KSLine) {
        // hack for newlay & dellay
        if (["newlay", "dellay", "ev"].includes(cmd.name)) return true;
        return ["characters", "times", "stages", "layer"]
            .includes(ObjectMapper.TypeOf(cmd.name));
    }

    // layerhandler
    // *resolve name
    // *resolve position
    // resolve display
    // resolve animation
    static Process(cmd: KSFunc) {
        let cb: (cmd?: KSFunc) => LayerControlData = () => { return undefined; };
        const layerType = ObjectMapper.TypeOf(cmd.name);
        switch (layerType) {
            case "characters":
                cb = (cmd: KSFunc) => Character.ProcessImage(cmd);
                break;
            case "times":
                cb = (cmd: KSFunc) => YZCG.SetDaytime(cmd.name);
                break;
            case "stages":
                cb = (cmd: KSFunc) => YZCG.ProcessBG(cmd);
                break;
            case "layer":
                cb = (cmd: KSFunc) => ({ name: cmd.name, layer: [] });
                break;
            default:
                switch (cmd.name) {
                    case "newlay":
                        cb = (cmd: KSFunc) => YZCG.NewLay(cmd);
                        break;
                    case "dellay":
                        YZCG.DelLay(cmd);
                        return;
                    case "ev":
                        cb = (cmd: KSFunc) => YZCG.ProcessEV(cmd);
                        break;
                }
        }
        const controlData = cb(cmd);
        const name = controlData.name;
        const reload = controlData.reload;
        const position = this.CalculatePosition(cmd);
        const zoom = this.CalculateZoom(cmd);
        const show = this.CalculateShow(cmd);
        if (reload) YZLayerMgr.Delete(name);
        YZLayerMgr.Set(name, controlData.layer, layerType);
        YZLayerMgr.Move(name, position);
        YZLayerMgr.Zoom(name, zoom);
        if (show === true) YZLayerMgr.Show(name);
        else if (show === false) YZLayerMgr.Hide(name);
        YZLayerMgr.Draw(name);
        return;
    }

    static CalculateSubLayer(cmd: KSLine): LayerControlData {
        return undefined;
    }

    static CalculatePosition(cmd: KSFunc): Point {
        // xpos and ypos will cover other value
        const { name, option, param } = cmd;
        // direct reset
        if (option.includes("reset")) return { x: 0, y: 0 };

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
