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
    private dom: JQuery<HTMLDivElement>;
    // override and ignore them
    constructor() {
        this.dom = $("#camera") as JQuery<HTMLDivElement>;
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
        this.dom
            .css("left", this.pos.x)
            .css("top", this.pos.y)
            .css("transform", `scale(${this.zoom})`);
    }

    Move(pos: Point) {
        this.pos = pos;
    }

    Zoom(zoom: number) {
        this.zoom = zoom / 100;
    }
}
