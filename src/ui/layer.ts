import { createElem, getElem, removeThisListener } from "../utils/dom";
import FilePath from "../utils/filepath";
import LayersToBlob from "../utils/canvas";

interface LayerData {
    width: number;
    height: number;
    left: number;
    top: number;
    zoom: number;
    files: LayerInfo[];
}

// Sub layer operation
// we wont need them anymore
class SubLayerUI {
    name: string;
    private fd: HTMLImageElement;
    private x: number;
    private y: number;

    constructor(name: string, parent: HTMLElement) {
        this.name = name;
        const elem = createElem("img", `sublayer_${this.name}`) as HTMLImageElement;
        parent.appendChild(elem);
        this.fd = elem;
        this.fd.style.display = "none";
        this.fd.src = FilePath.findByType(this.name, "image");
    }

    Draw(offset: Point) {
        const { x: _left, y: _top } = offset;
        this.fd.style.left = _left + "px";
        this.fd.style.top = _top + "px";
        this.fd.style.display = "";
    }

    Delete() {
        this.fd.remove();
    }

    async GetSize() {
        if (!this.x || !this.y) { // not cached
            const elm = this.fd;
            if (!elm.complete) { // not loaded
                await new Promise((resolve, reject) => { // wait image loaded
                    const cb = (e: Event) => {
                        removeThisListener(e, cb);
                        resolve();
                    };
                    this.fd.addEventListener("load", cb);
                    const cb2 = (e: Event) => {
                        removeThisListener(e, cb2);
                        reject();
                    };
                    this.fd.addEventListener("error", cb2);
                });
            }
            // ok,  now it's loaded
            this.x = elm.naturalWidth;
            this.y = elm.naturalHeight;
        }
        return [this.x, this.y];
    }

    ZIndex(z: number) {
        this.fd.style.zIndex = z.toString();
    }
}

export default class LayerUI {
    static rootDOM: HTMLElement;
    name: string;

    private previous: LayerData = {
        width: 0,
        height: 0,
        left: 0,    // relative offset with center
        top: 0,     // ......
        zoom: 100,
        files: [],
    };
    private current: LayerData;
    private showed = true;

    private fd: HTMLElement;
    private sublayer: { [name: string]: SubLayerUI } = {};

    constructor(name: string, files: LayerInfo[], zindex?: number) {
        this.name = name;
        this.previous = {
            width: 0,
            height: 0,
            left: 0,    // relative offset with center
            top: 0,     // ......
            zoom: 100,
            files: [],
        };
        this.current = JSON.parse(JSON.stringify(this.previous));
        this.current.files = files || [];

        this.fd = getElem(`#layer_${this.name}`);
        this.sublayer = {};
        // generate div if not exist
        if (this.fd === null) {
            const elem = createElem("div", `layer_${this.name}`);
            elem.style.zIndex = (zindex || 1).toString();
            LayerUI.rootDOM.appendChild(elem);
            this.fd = elem;
        }
    }

    SetSubLayer(files: LayerInfo[]) {
        if (!files || files.length <= 0) return;
        // maybe diff here
        this.current.files = files || [];
        const newLayers = this.current.files.map(l => l.name);
        const onScreenlayer = Object.keys(this.sublayer);
        const deleted = onScreenlayer.filter(l => !newLayers.includes(l));
        const added = newLayers.filter(l => !onScreenlayer.includes(l));
        if (deleted.length > 0 || added.length > 0) this.showed = true;
    }

    SetSize(size: Point) {
        this.current.height = size.y;
        this.current.width = size.x;
    }

    SetZoomCenter(pos: Point) {
        // TODO: is this ok? Maybe make x optional
        this.fd.style.transformOrigin = `${pos.x}% ${pos.y}%`;
    }

    // when [begintrans] called, do not exec Draw()
    // when [endtrans %TRANS%] called, set trans, then Draw()
    // rewrite to use canvas layer manipulate
    async Draw() {
        const b = await LayersToBlob(this.current.files, {
            y: this.current.height,
            x: this.current.width
        });
        const u = URL.createObjectURL(b);
        const i = new Image();
        i.src = u;
        debugger;
        if (!this.showed) return;
        // cancel all animation
        // fadeout and drop old img? for character
        // for bg, just slide them

        const oldLayers = this.previous.files.map(l => l.name);
        const newLayers = this.current.files.map(l => l.name);
        if (newLayers.length === 0) {
            this.current.files = this.previous.files;
        }
        const onScreenlayer = Object.keys(this.sublayer);
        const deleted = onScreenlayer.filter(l => !newLayers.includes(l));
        const added = newLayers.filter(l => !onScreenlayer.includes(l));
        // oldLayers.forEach(f => this.subfd[f].finish());
        added.forEach(f => this.sublayer[f] = new SubLayerUI(f, this.fd));

        // execute transOut
        // Apply for all missing layer
        // in fact not executed here now...
        deleted.forEach(f => {
            this.sublayer[f].Delete();
            delete this.sublayer[f];
        });

        // fix z-index
        newLayers.forEach((f, i) => {
            this.sublayer[f].ZIndex(i);
        });
        // execute transIn
        // Apply for all added layer
        const [_winW, _winH] = Config.Display.WindowSize;
        const [_maxHeight, _maxWidth, _minHeight, _minWidth] = await this._DrawAndCalculateSubLayer();
        const [_divWidth, _divHeight] = [_maxWidth + _minWidth, _maxHeight + _minHeight];
        // when all draw complete
        // start animation
        const [_drawWidth, _drawHeight] = [_maxWidth - _minWidth, _maxHeight - _minHeight];
        const [_divLeft, _divTop] = [
            (_winW - _drawWidth) / 2 - _minWidth + this.current.left,
            (_winH - _drawHeight) / 2 - _minHeight + this.current.top
        ];
        this.current.height = this.current.height || _divHeight;
        this.current.width = this.current.width || _divWidth;
        this._DrawLayer(_divLeft, _divTop, this.current.height, this.current.width, this.current.zoom);
        this.previous = JSON.parse(JSON.stringify(this.current));
    }

    // going to remove this
    private async _DrawAndCalculateSubLayer() {
        // TODO: not 'thread safe'
        const _maxHeightArray: number[] = [];
        const _maxWidthArray: number[] = [];
        const _minHeightArray: number[] = [];
        const _minWidthArray: number[] = [];
        await Promise.all(this.current.files.map(f =>
            (async () => {
                const { name, offset, size } = f;
                const _offset = offset || { x: 0, y: 0 };
                let _width;
                let _height;
                if (!size || !isFinite(size.x) || !isFinite(size.y)) { // need get size
                    [_width, _height] = await this.sublayer[name].GetSize();
                }
                else {
                    _width = size.x;
                    _height = size.y;
                }
                const THERSHOLD = 16;
                if (_width + _height <= THERSHOLD) return;
                // calculate image draw window
                const { x: _left, y: _top } = _offset;
                _maxWidthArray.push(_left + _width);
                _maxHeightArray.push(_top + _height);
                _minWidthArray.push(_left);
                _minHeightArray.push(_top);
                this.sublayer[name].Draw(_offset);
            })() // Run in IIFE, it returns a Promise
        ));  // and Promise wait all... );})())); :-)
        const _maxHeight = _maxHeightArray.reduce((p, c) => p > c ? p : c, Number.MIN_SAFE_INTEGER);
        const _maxWidth = _maxWidthArray.reduce((p, c) => p > c ? p : c, Number.MIN_SAFE_INTEGER);
        const _minHeight = _minHeightArray.reduce((p, c) => p < c ? p : c, Number.MAX_SAFE_INTEGER);
        const _minWidth = _minWidthArray.reduce((p, c) => p < c ? p : c, Number.MAX_SAFE_INTEGER);
        return [_maxHeight, _maxWidth, _minHeight, _minWidth];
    }

    private _DrawLayer(left: number, top: number, height: number, width: number, zoom: number) {
        const realZoom = zoom / 100;
        this.fd.style.display = "";
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
        this.fd.style.display = "none";
    }

    Delete() { // clear DOM .etc
        // draw last time, to execute transOut
        this.Draw();
        this.fd.remove();
    }

    Move(pos: Point) {
        if (isFinite(pos.x)) this.current.left = pos.x;
        if (isFinite(pos.y)) this.current.top = pos.y;
    }

    Zoom(zoom: number) {
        if (isFinite(zoom)) this.current.zoom = zoom;
    }
}
