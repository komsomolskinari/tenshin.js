import { KAGConst } from "../../const";
import ObjectMapper from "../../objectmapper";

export default class LayerBase {
    readonly zindex: number = 10;
    protected reload = false;

    static GetInstance(cmd: KSFunc): LayerBase {
        return new LayerBase();
    }
    CalculateReload(cmd: KSFunc): boolean {
        const ret = this.reload;
        this.reload = false;
        return ret;
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
        return this.CalculatePositionWithPZoom(cmd, 1);
    }
    CalculatePositionWithPZoom(cmd: KSFunc, zoom: number) {
        // xpos and ypos will cover other value
        const { name, option, param } = cmd;
        // direct reset
        if (option.includes("reset") || option.includes("resetpos")) return { x: 0, y: 0 };

        const mapped = ObjectMapper.ConvertAll(option);
        const _mapX = parseInt(((mapped.positions || [])
            .filter((p: any) => p.xpos !== undefined)
            .map((p: any) => p.xpos)[0]));
        const mapX = Number.isFinite(_mapX) ? _mapX : undefined;
        // type sensitive
        const paramX = (param.xpos !== undefined) ? parseInt(param.xpos as string) : undefined;
        const paramY = (param.ypos !== undefined) ? parseInt(param.ypos as string) : undefined;
        const finalX = (mapX !== undefined ? mapX : paramX) * zoom;
        const finalY = paramY * zoom;
        return { x: Number.isFinite(finalX) ? finalX : undefined, y: Number.isFinite(finalY) ? finalY : undefined };
    }
    CalculateName(cmd: KSFunc): string {
        return "";
    }
    CalculateSubLayer(cmd: KSFunc): LayerInfo[] {
        return undefined;
    }
    CalculateZoomCenter(cmd: KSFunc): Point {
        return { x: 50, y: 50 };
    }
    CalculateSize(cmd: KSFunc): Point {
        return;
    }
}
