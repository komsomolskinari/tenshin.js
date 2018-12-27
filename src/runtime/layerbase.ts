import { KAGConst } from "../const";
import ObjectMapper from "../objectmapper";

export default class LayerBase {
    readonly positionZoom: number = 1;
    static GetInstance(cmd: KSFunc): LayerBase {
        return new LayerBase();
    }
    CalculateShowHide(cmd: KSFunc): boolean {
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
    CalculateZoom(cmd: KSFunc): number {
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
    CalculatePosition(cmd: KSFunc): Point {
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
        const paramX = (param.xpos !== undefined) ? parseInt(param.xpos as string) * this.positionZoom : undefined;
        const paramY = (param.ypos !== undefined) ? parseInt(param.ypos as string) * this.positionZoom : undefined;

        const finalX = parseInt(mapX) || paramX;
        const finalY = paramY;
        return { x: finalX, y: finalY as number };
    }
    CalculateSubLayer(cmd: KSFunc): LayerControlData {
        return undefined;
    }
}
