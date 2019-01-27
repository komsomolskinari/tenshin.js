import { GetLayerSize, LayersToBlob } from "../utils/canvas";
import { createElem, getElem } from "../utils/dom";

export default class LayerUI {
    static rootDOM: HTMLElement;
    name: string;

    private state: {
        width: number;
        height: number;
        left: number;
        top: number;
        zoom: number;
        files: LayerInfo[];
    };
    private showed = true;

    private fd: HTMLImageElement;

    constructor(name: string, files: LayerInfo[], zindex?: number) {
        this.name = name;
        this.state = {
            width: 0,
            height: 0,
            left: 0,    // relative offset with center
            top: 0,     // ......
            zoom: 100,
            files: [],
        };
        this.state.files = files || [];

        this.fd = getElem(`#layer_${this.name}`) as HTMLImageElement;

        // generate div if not exist
        if (this.fd === null) {
            const elem = createElem("img", `layer_${this.name}`) as HTMLImageElement;
            elem.style.zIndex = (zindex || 1).toString();
            LayerUI.rootDOM.appendChild(elem);
            this.fd = elem;
        }
    }

    SetSubLayer(files: LayerInfo[]) {
        if (!files || files.length <= 0) return;
        this.state.files = files || [];
    }

    SetSize(size: Point) {
        this.state.height = size.y;
        this.state.width = size.x;
    }

    SetZoomCenter(pos: Point) {
        // TODO: is this ok? Maybe make x optional
        this.fd.style.transformOrigin = `${pos.x}% ${pos.y}%`;
    }

    // when [begintrans] called, do not exec Draw()
    // when [endtrans %TRANS%] called, set trans, then Draw()
    // rewrite to use canvas layer manipulate
    async Draw() {
        if (!this.showed) return;
        // fadeout and drop old img? for character
        // for bg, just slide them
        const [_winW, _winH] = Config.Display.WindowSize;
        const [_maxHeight, _maxWidth, _minHeight, _minWidth] = await this._DrawAndCalculateSubLayer();
        const [_divWidth, _divHeight] = [_maxWidth + _minWidth, _maxHeight + _minHeight];
        const [_drawWidth, _drawHeight] = [_maxWidth - _minWidth, _maxHeight - _minHeight];
        const [_divLeft, _divTop] = [
            (_winW - _drawWidth) / 2 - _minWidth + this.state.left,
            (_winH - _drawHeight) / 2 - _minHeight + this.state.top
        ];
        this.state.height = this.state.height || _divHeight;
        this.state.width = this.state.width || _divWidth;
        this._SetCSS(_divLeft, _divTop, this.state.height, this.state.width, this.state.zoom);

        const blob = await LayersToBlob(this.state.files, {
            y: this.state.height,
            x: this.state.width
        });
        const url = URL.createObjectURL(blob);
        URL.revokeObjectURL(this.fd.src);
        this.fd.src = url; // here, image is on screen

    }

    // going to remove this
    private async _DrawAndCalculateSubLayer() {
        const _maxHeightArray: number[] = [];
        const _maxWidthArray: number[] = [];
        const _minHeightArray: number[] = [];
        const _minWidthArray: number[] = [];
        await Promise.all(this.state.files.map(f =>
            (async () => {
                const { name, offset, size } = f;
                const _offset = offset || { x: 0, y: 0 };
                let _width;
                let _height;
                if (!size || !isFinite(size.x) || !isFinite(size.y)) { // need get size
                    const t = await GetLayerSize(name);
                    _width = t.x;
                    _height = t.y;
                }
                else {
                    _width = size.x;
                    _height = size.y;
                }
                const THERSHOLD = 16;
                if (_width + _height <= THERSHOLD) return;
                const { x: _left, y: _top } = _offset;
                _maxWidthArray.push(_left + _width);
                _maxHeightArray.push(_top + _height);
                _minWidthArray.push(_left);
                _minHeightArray.push(_top);
            })() // Run in IIFE, it returns a Promise
        ));  // and Promise wait all... );})())); :-)
        const _maxHeight = _maxHeightArray.reduce((p, c) => p > c ? p : c, Number.MIN_SAFE_INTEGER);
        const _maxWidth = _maxWidthArray.reduce((p, c) => p > c ? p : c, Number.MIN_SAFE_INTEGER);
        const _minHeight = _minHeightArray.reduce((p, c) => p < c ? p : c, Number.MAX_SAFE_INTEGER);
        const _minWidth = _minWidthArray.reduce((p, c) => p < c ? p : c, Number.MAX_SAFE_INTEGER);
        return [_maxHeight, _maxWidth, _minHeight, _minWidth];
    }

    private _SetCSS(left: number, top: number, height: number, width: number, zoom: number) {
        const realZoom = zoom / 100;
        // a final check, if showed change to false when async
        this.fd.style.display = this.showed ? "" : "none";
        this.fd.style.top = top + "px";
        this.fd.style.left = left + "px";
        // fd height & width has unexpected influence to zoom position
        this.fd.style.height = height + "px";
        this.fd.style.width = width + "px";
        this.fd.style.transform = `scale(${realZoom})`;
    }

    Show() {
        this.showed = true;
    }

    Hide() {
        this.showed = false;
        this.fd.style.display = "none"; // another hide logic
    }

    Delete() { // clear DOM .etc
        // draw last time, to execute transOut
        this.Draw();
        this.fd.remove();
    }

    Move(pos: Point) {
        if (isFinite(pos.x)) this.state.left = pos.x;
        if (isFinite(pos.y)) this.state.top = pos.y;
    }

    Zoom(zoom: number) {
        if (isFinite(zoom)) this.state.zoom = zoom;
    }
}
