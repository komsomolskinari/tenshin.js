import { getElem } from "../utils/dom";

export default class YZCamera {
    private static instance: YZCamera;
    static GetInstance(): YZCamera {
        if (this.instance === undefined) {
            this.instance = new YZCamera();
        }
        return this.instance;
    }
    private zoom = 1;
    private pos = { x: 0, y: 0 };
    private dom: HTMLDivElement;
    // override and ignore them
    constructor() {
        this.dom = getElem("#camera") as HTMLDivElement;
    }
    SetSubLayer(files: LayerInfo[]) {
        // pass
    }
    SetSize(size: Point) {
        // pass
    }
    SetZoomCenter(pos: Point) {
        // pass
    }
    Show() {
        // pass
    }
    Hide() {
        // pass
    }
    Delete() {
        // pass
    }

    // do real logic here
    async Draw() {
        this.dom.style.left = this.pos.x + "px";
        this.dom.style.top = this.pos.y + "px";
        this.dom.style.transform = `scale(${this.zoom})`;
    }

    Move(pos: Point) {
        this.pos = pos;
    }

    Zoom(zoom: number) {
        this.zoom = zoom / 100;
    }
}
