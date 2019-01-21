import LayerBase from "./base";

export default class LayerCamera extends LayerBase {
    readonly zindex: number = 0;
    static GetInstance(cmd: KSFunc): LayerCamera {
        return new LayerCamera();
    }
    CalculateShowHide(cmd: KSFunc): boolean {
        return true;
    }
    CalculateZoom(cmd: KSFunc): number {
        const { name, option, param } = cmd;
        if (option.includes("resetcamera")) return 100;
        return (param.camerazoom !== undefined) ? parseInt(param.camerazoom) : undefined;
    }
    CalculateName(cmd: KSFunc): string {
        return "camera";
    }
    CalculateSubLayer(cmd: KSFunc): LayerInfo[] {
        return [];
    }
    CalculatePosition(cmd: KSFunc): Point {
        return this.CalculatePositionWithPZoom(cmd, 0.4);
    }
    CalculatePositionWithPZoom(cmd: KSFunc, zoom: number) {
        // xpos and ypos will cover other value
        const { name, option, param } = cmd;
        // direct reset
        if (option.includes("resetcamera")) return { x: 0, y: 0 };
        // type sensitive
        const paramX = (param.camerax !== undefined) ? parseInt(param.camerax) : undefined;
        const paramY = (param.cameray !== undefined) ? parseInt(param.cameray) : undefined;
        const finalX = paramX * zoom;
        const finalY = paramY * zoom;
        return { x: Number.isFinite(finalX) ? -finalX : undefined, y: Number.isFinite(finalY) ? finalY : undefined };
    }
}
