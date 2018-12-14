import ObjectMapper from "../objectmapper";
import Character from "./character";
import YZBgImg from "./bgimg";
import YZCG from "./cg";
import YZLayerMgr from "../ui/layer";

export default class YZLayerHandler {
    static isLayer(cmd: KSLine) {
        // hack for newlay & dellay
        if (["newlay", "dellay"].includes(cmd.name)) return true;
        return ["characters", "times", "stages", "layer"]
            .includes(ObjectMapper.TypeOf(cmd.name));
    }

    // layerhandler
    // *resolve name
    // *resolve position
    // resolve display
    // resolve animation
    static Process(cmd: KSLine) {
        if (cmd.name === "newlay") {
            YZCG.NewLay(cmd);
        }
        if (cmd.name === "dellay") {
            YZCG.DelLay(cmd);
        }
        let cb: (cmd?: KSLine) => LayerControlData = () => { return undefined; };
        const layerType = ObjectMapper.TypeOf(cmd.name);
        switch (layerType) {
            case "characters":
                cb = (cmd: KSLine) => Character.ProcessImage(cmd);
                break;
            case "times":
                cb = (cmd: KSLine) => YZBgImg.SetDaytime(cmd.name);
                break;
            case "stages":
                cb = (cmd: KSLine) => YZBgImg.Process(cmd);
                break;
            case "layer":
                cb = (cmd: KSLine) => YZCG.ProcessLay(cmd);
                break;
            default:
                return;
        }
        const controlData = cb(cmd);
        const name = controlData.name;
        const position = this.CalculatePosition(cmd);
        const zoom = this.CalculateZoom(cmd);
        YZLayerMgr.Set(name, controlData.layer, layerType);
        YZLayerMgr.Move(name, position);
        YZLayerMgr.Zoom(name, zoom);
        YZLayerMgr.Draw(name);
    }

    // name reslover : input a full cmd, output layers and name
    static CalculateSubLayer(cmd: KSLine): LayerControlData {
        return undefined;
    }
    // position resolver
    // not applied yet
    static CalculatePosition(cmd: KSLine): Point {
        // xpos and ypos will cover other value
        const { name, option, param } = cmd;
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

    static CalculateZoom(cmd: KSLine): number {
        const { name, option, param } = cmd;
        const mapped = ObjectMapper.ConvertAll(option);
        const mapZoomLevel = ((mapped.positions || [])
            .filter((p: any) => p.level !== undefined)
            .map((p: any) => p.level)[0])
            || undefined;
        const mapZoom = (mapZoomLevel === undefined) ? undefined : ObjectMapper.innerobj.levels[mapZoomLevel].zoom;
        const paramZoom = (param.zoom !== undefined) ? parseInt(param.zoom as string) : undefined;
        const finalZoom = parseInt(mapZoom) || paramZoom;
        return finalZoom;
    }
}
