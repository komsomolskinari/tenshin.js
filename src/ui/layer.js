import FilePath from "../utils/filepath";
// methods:
// draw multiple layer
//     with or without coordinate offset
// layer zoom and positioning

// Sub layer operation
class YZSubLayer {
    constructor(name, parent) {
        this.name = name;
        parent.append(
            $('<img>').attr('id', `sublayer_${this.name}`)
        );
        this.fd = $(`#sublayer_${this.name}`);
        this.fd
            .css('display', 'none')
            .attr('src', FilePath.findMedia(this.name, 'image'));
    }

    Draw(offset) {
        const [_left, _top] = offset;
        this.fd
            .css('left', _left)
            .css('top', _top)
            .css('display', '');
    }

    Delete() {
        this.fd.remove();
    }

    async GetSize() {
        let _width;
        let _height = parseInt(this.fd.get(0).naturalHeight);
        // not loaded
        if (!_height) {
            // wait image loaded
            await new Promise((resolve, reject) => {
                this.fd.one('load', () => resolve());
                this.fd.one('error', () => reject());
            });
        }
        // ok, it's now loaded
        _width = parseInt(this.fd.get(0).naturalWidth);
        _height = parseInt(this.fd.get(0).naturalHeight);
        return [_width, _height];
    }
    ZIndex(z) {
        this.fd.css('z-index', z);
    }
}

class YZLayer {
    static Init() {
        this.rootDOM = $('#camera');
    }
    constructor(name, files, type, zindex) {
        this.name = name;
        this.type = type;
        this.previous = {
            width: 0,
            height: 0,
            left: 0,    // relative offset with center
            top: 0,     // ......
            zoom: 100,
            files: [],
        }
        this.drawlock = false;
        this.current = JSON.parse(JSON.stringify(this.previous));
        this.current.files = files || [];
        this.transIn = [];
        this.transOut = [];
        this.actionSeq = [];

        this.fd = $(`#layer_${this.name}`);
        this.sublayer = {};
        // generate div if not exist
        if (this.fd.length == 0) {
            YZLayer.rootDOM.append(
                $('<div>')
                    .attr('id', `layer_${this.name}`)
                    .css('z-index', zindex)
            )
            this.fd = $(`#layer_${this.name}`);
        }
    }

    SetSubLayer(files) {
        // maybe diff here
        this.current.files = files || [];
    }

    SetSize(width, height) {
        this.current.height = height;
        this.current.width = width;
    }

    // when [begintrans] called, do not exec Draw()
    // when [endtrans %TRANS%] called, set trans, then Draw()
    async Draw() {
        if (this.drawlock) return;
        this.drawlock = true;
        // cancel all animation
        this.fd.finish();
        let oldLayers = this.previous.files.map(l => l.name);
        let newLayers = this.current.files.map(l => l.name);
        if (newLayers.length == 0) {
            this.current.files = this.previous.files;
            console.log('!no change!')
        }
        let deleted = oldLayers.filter(l => !newLayers.includes(l));
        let added = newLayers.filter(l => !oldLayers.includes(l));
        console.log(this.name, oldLayers, newLayers, deleted, added);
        //oldLayers.forEach(f => this.subfd[f].finish());

        added.forEach(f => this.sublayer[f] = new YZSubLayer(f, this.fd));

        // execute transOut
        // Apply for all missing layer
        // in fact not executed here now...
        deleted.forEach(f => {
            this.sublayer[f].Delete()
            delete this.sublayer[f];
            console.log('no layer', f);
        })

        // fix z-index
        newLayers.forEach((f, i) => {
            this.sublayer[f].ZIndex(i);
        })
        // execute transIn
        // Apply for all added layer
        let _maxHeight = -10000;
        let _maxWidth = -10000;
        let _minHeight = 10000; // set a big value
        let _minWidth = 10000;
        const [_winW, _winH] = Config.Display.WindowSize;

        await Promise.all(this.current.files.map(f =>
            (async () => {
                let { name, offset, size } = f;
                // default offset [0,0]
                offset = offset || [0, 0];
                // get size when loaded
                let _width;
                let _height;
                // need get size
                if (!size) [_width, _height] = await this.sublayer[name].GetSize();
                else[_width, _height] = size;

                const [_left, _top] = offset;
                _minWidth = _left < _minWidth ? _left : _minWidth;
                _minHeight = _top < _minHeight ? _top : _minHeight;
                _maxWidth = (_left + _width) > _maxWidth ? (_left + _width) : _maxWidth;
                _maxHeight = (_top + _height) > _maxHeight ? (_top + _height) : _maxHeight;

                this.sublayer[name].Draw(offset);
            })() // Wait an IIFE, it returns a Promise
        ));  // and Promise wait all... );})()));

        // when all draw complete
        // start animation
        const [_fullWidth, _fullHeight] = [_maxWidth - _minWidth, _maxHeight - _minHeight]
        const [_fullLeft, _fullTop] = [
            (_winW - _fullWidth) / 2 - _minWidth + this.current.left,
            (_winH - _fullHeight) / 2 - _minHeight + this.current.top
        ]
        // set main zoom, offset
        this.fd
            .css('display', '')
            .css('left', _fullLeft)
            .css('top', _fullTop)
            .css('height', _fullHeight)
            .css('width', _fullWidth)
            .css('transform', `scale(${this.current.zoom / 100})`);

        this.previous = JSON.parse(JSON.stringify(this.current));
        this.drawlock = false;
    }

    Hide() {
        this.fd.css('display', 'none');
    }

    // clear DOM .etc
    Delete() {
        // draw last time, to execute transOut
        this.Draw()
        this.fd.remove();
    }

    Move(left, top) {
        this.current.left = left;
        this.current.top = top;
    }

    Zoom(zoom) {
        this.current.zoom = zoom;
    }
}
// problem: how to handle 'env', or camera layer?
// simulate it to a normal layer?
export default class YZLayerMgr {
    static Init() {
        YZLayer.Init();
        this.layers = {};
        this.type2zindex = {
            stages: 1,
            characters: 5
        };
    }
    /**
     * Set a layer (new or existed)
     * @param {String} name 
     * @param {[{name: String,offset:[Number,Number],size:[Number,Number]}]} files 
     */
    static Set(name, files, type) {
        if (!this.layers[name]) {
            this.layers[name] = new YZLayer(name, files, type, this.type2zindex[type]);
        }
        else {
            if (files && files.length > 0) this.layers[name].SetSubLayer(files);
        }
    }

    static Delete(name) {
        this.layers[name].Delete();
        delete this.layers[name];
    }

    // apply command when draw called
    static Draw(name) {
        this.layers[name].Draw();
    }

    static Show(name) {
        this.layers[name].Draw();
    }

    static Hide(name) {
        this.layers[name].Hide();
    }

    static Move(name, x, y) {
        this.layers[name].Move(x, y);
    }

    static Zoom(name, zoom) {
        this.layers[name].Zoom(zoom);
    }

    // push animate command
    static Animate() {

    }
}
window.YZLayer = YZLayer;
window.YZLayerMgr = YZLayerMgr;