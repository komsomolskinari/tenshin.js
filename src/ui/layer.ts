import FilePath from "../utils/filepath";

interface YZLayerData {
    width: number;
    height: number;
    left: number;
    top: number;
    zoom: number;
    files: LayerInfo[];
}

// methods:
// draw multiple layer
//     with or without coordinate offset
// layer zoom and positioning

// Sub layer operation
class YZSubLayer {
    name: string;
    fd: JQuery<HTMLElement>;

    constructor(name: string, parent: JQuery<HTMLElement>) {
        this.name = name;
        parent.append(
            $("<img>").attr("id", `sublayer_${this.name}`)
        );
        this.fd = $(`#sublayer_${this.name}`);
        this.fd
            .css("display", "none")
            .attr("src", FilePath.findMedia(this.name, "image"));
    }

    Draw(offset: Point) {
        const { x: _left, y: _top } = offset;
        this.fd
            .css("left", _left)
            .css("top", _top)
            .css("display", "");
    }

    Delete() {
        this.fd.remove();
    }

    async GetSize() {
        const elm = this.fd.get(0) as HTMLImageElement;
        let _width;
        let _height = elm.naturalHeight;
        // not loaded
        if (!_height) {
            // wait image loaded
            await new Promise((resolve, reject) => {
                this.fd.one("load", () => resolve());
                this.fd.one("error", () => reject());
            });
        }
        // ok, it's now loaded
        _width = elm.naturalWidth;
        _height = elm.naturalHeight;
        return [_width, _height];
    }

    ZIndex(z: number) {
        this.fd.css("z-index", z);
    }
}

class YZLayer {
    static rootDOM: JQuery<HTMLElement>;
    name: string;
    type: string;

    previous: YZLayerData = {
        width: 0,
        height: 0,
        left: 0,    // relative offset with center
        top: 0,     // ......
        zoom: 100,
        files: [],
    };
    current: YZLayerData;
    drawlock = false;
    transIn: any[] = [];
    transOut: any[] = [];
    actionSeq: any[] = [];

    fd: JQuery<HTMLElement>;
    sublayer: { [name: string]: YZSubLayer } = {};

    static Init() {
        this.rootDOM = $("#camera");
    }

    constructor(name: string, files: LayerInfo[], type: string, zindex: number) {
        this.name = name;
        this.type = type;
        this.previous = {
            width: 0,
            height: 0,
            left: 0,    // relative offset with center
            top: 0,     // ......
            zoom: 100,
            files: [],
        };
        this.drawlock = false;
        this.current = JSON.parse(JSON.stringify(this.previous));
        this.current.files = files || [];
        this.transIn = [];
        this.transOut = [];
        this.actionSeq = [];

        this.fd = $(`#layer_${this.name}`);
        this.sublayer = {};
        // generate div if not exist
        if (this.fd.length === 0) {
            YZLayer.rootDOM.append(
                $("<div>")
                    .attr("id", `layer_${this.name}`)
                    .css("z-index", zindex)
            );
            this.fd = $(`#layer_${this.name}`);
        }
    }

    SetSubLayer(files: LayerInfo[]) {
        // maybe diff here
        this.current.files = files || [];
    }

    SetSize(size: Point) {
        this.current.height = size.y;
        this.current.width = size.x;
    }

    // when [begintrans] called, do not exec Draw()
    // when [endtrans %TRANS%] called, set trans, then Draw()
    async Draw() {
        if (this.drawlock) return;
        this.drawlock = true;
        // cancel all animation
        this.fd.finish();
        const oldLayers = this.previous.files.map(l => l.name);
        const newLayers = this.current.files.map(l => l.name);
        if (newLayers.length === 0) {
            this.current.files = this.previous.files;
        }
        const deleted = oldLayers.filter(l => !newLayers.includes(l));
        const added = newLayers.filter(l => !oldLayers.includes(l));
        // oldLayers.forEach(f => this.subfd[f].finish());

        added.forEach(f => this.sublayer[f] = new YZSubLayer(f, this.fd));

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
        let _maxHeight = -10000;
        let _maxWidth = -10000;
        let _minHeight = 10000; // set a big value
        let _minWidth = 10000;
        const [_winW, _winH] = Config.Display.WindowSize;

        await Promise.all(this.current.files.map(f =>
            (async () => {
                const { name, offset, size } = f;
                // default offset [0,0]
                const _offset = offset || { x: 0, y: 0 };
                // get size when loaded
                let _width;
                let _height;
                // need get size
                if (!size) [_width, _height] = await this.sublayer[name].GetSize();
                else {
                    size.x = _width;
                    size.y = _height;
                }

                const { x: _left, y: _top } = _offset;
                _minWidth = _left < _minWidth ? _left : _minWidth;
                _minHeight = _top < _minHeight ? _top : _minHeight;
                _maxWidth = (_left + _width) > _maxWidth ? (_left + _width) : _maxWidth;
                _maxHeight = (_top + _height) > _maxHeight ? (_top + _height) : _maxHeight;

                this.sublayer[name].Draw(_offset);
            })() // Wait an IIFE, it returns a Promise
        ));  // and Promise wait all... );})()));

        // when all draw complete
        // start animation
        const [_fullWidth, _fullHeight] = [_maxWidth - _minWidth, _maxHeight - _minHeight];
        const [_fullLeft, _fullTop] = [
            (_winW - _fullWidth) / 2 - _minWidth + this.current.left,
            (_winH - _fullHeight) / 2 - _minHeight + this.current.top
        ];
        // set main zoom, offset
        this.fd
            .css("display", "")
            .css("left", _fullLeft)
            .css("top", _fullTop)
            .css("height", _fullHeight)
            .css("width", _fullWidth)
            .css("transform", `scale(${this.current.zoom / 100})`);

        this.previous = JSON.parse(JSON.stringify(this.current));
        this.drawlock = false;
    }

    Hide() {
        this.fd.css("display", "none");
    }

    // clear DOM .etc
    Delete() {
        // draw last time, to execute transOut
        this.Draw();
        this.fd.remove();
    }

    Move(pos: Point) {
        if (pos.x !== undefined) this.current.left = pos.x;
        if (pos.y !== undefined) this.current.top = pos.y;
    }

    Zoom(zoom: number) {
        this.current.zoom = zoom;
    }
}
// problem: how to handle 'env', or camera layer?
// simulate it to a normal layer?
export default class YZLayerMgr {
    static layers: {
        [name: string]: YZLayer
    } = {};
    static type2zindex: {
        [type: string]: number
    } = {
            stages: 1,
            characters: 5
        };

    static Init() {
        YZLayer.Init();
    }

    /**
     * Set a layer (new or existed)
     * @param {String} name
     * @param {[{name: String,offset:[Number,Number],size:[Number,Number]}]} files
     */
    static Set(name: string, files: LayerInfo[], type?: string) {
        if (!this.layers[name]) {
            this.layers[name] = new YZLayer(name, files, type, this.type2zindex[type]);
        }
        else {
            if (files && files.length > 0) this.layers[name].SetSubLayer(files);
        }
    }

    static Delete(name: string) {
        const t = this.layers[name];
        if (!t) return;
        t.Delete();
        delete this.layers[name];
    }

    // apply command when draw called
    static Draw(name: string) {
        this.layers[name].Draw();
    }

    static Show(name: string) {
        this.layers[name].Draw();
    }

    static Hide(name: string) {
        this.layers[name].Hide();
    }

    static Move(name: string, pos: Point) {
        this.layers[name].Move(pos);
    }

    static Zoom(name: string, zoom: number) {
        this.layers[name].Zoom(zoom);
    }

    // push animate command
    static Animate() {
        throw Error("not implement");
    }
}
