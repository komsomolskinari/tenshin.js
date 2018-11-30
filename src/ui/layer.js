import FilePath from "../utils/filepath";
// methods:
// draw multiple layer
//     with or without coordinate offset
// layer zoom and positioning

class YZLayer {
    static Init() {
        this.rootDOM = $('#camera');
    }
    constructor(name, files) {
        this.name = name;
        this.previous = {
            width: 0,
            height: 0,
            left: 0,    // relative offset with center
            top: 0,     // ......
            zoom: 100,
            files: [],
        }
        this.current = JSON.parse(JSON.stringify(this.previous));
        this.current.files = files || [];
        this.transIn = [];
        this.transOut = [];
        this.actionSeq = [];

        this.fd = $(`#layer_${this.name}`);
        this.subfd = {};
        // generate div if not exist
        if (this.fd.length == 0) {
            YZLayer.rootDOM.append(
                $('<div>').attr('id', `layer_${this.name}`)
            )
            this.fd = $(`#layer_${this.name}`);
        }
    }

    SetSubLayer(files) {
        this.current.files = files || [];
    }

    SetSize(width, height) {
        this.current.height = height;
        this.current.width = width;
    }

    // when [begintrans] called, do not exec Draw()
    // when [endtrans %TRANS%] called, set trans, then Draw()
    async Draw() {
        // cancel all animation
        this.fd.finish();
        let oldLayers = this.previous.files.map(l => l.name);
        let newLayers = this.current.files.map(l => l.name);
        let deleted = oldLayers.filter(l => !newLayers.includes(l));
        let added = newLayers.filter(l => !oldLayers.includes(l));
        oldLayers.forEach(f => this.subfd[f].stop());

        added.forEach(f => {
            this.fd.append(
                $('<img>').attr('id', `sublayer_${this.name}_${f}`)
            );
            this.subfd[f] = $(`#sublayer_${this.name}_${f}`)
        });

        // execute transOut
        // Apply for all missing layer
        // in fact not executed here now...
        deleted.forEach(f => {
            this.subfd[f].remove()
            delete this.subfd[f];
        })

        // fix z-index
        newLayers.forEach((f, i) => {
            this.subfd[f].css('z-index', i);
        })

        // load image
        added.forEach(f => {
            this.subfd[f]
                .attr('src', FilePath.findMedia(f, 'image'))
                .attr('display', 'none');
        })
        // execute transIn
        // Apply for all added layer
        let _maxHeight = -10000;
        let _maxWidth = -10000;
        let _minHeight = 10000; // set a big value
        let _minWidth = 10000;
        const [_winW, _winH] = Config.Display.WindowSize;

        let _lock = []; // promises here
        this.current.files.forEach(f => {
            _lock.push(
                (async () => {
                    let { name, offset, size } = f;
                    // default offset [0,0]
                    offset = offset || [0, 0];
                    // get size when loaded
                    let _width;
                    let _height = parseInt(this.subfd[name].get(0).naturalHeight);
                    // need get size
                    if (!size) {
                        // not loaded
                        if (!_height) {
                            // wait image loaded
                            await new Promise((resolve, reject) => {
                                this.subfd[name].on('load', () => resolve());
                                this.subfd[name].on('error', () => reject());
                            });
                        }
                        // ok, it's now loaded
                        _width = parseInt(this.subfd[name].get(0).naturalWidth);
                        _height = parseInt(this.subfd[name].get(0).naturalHeight);
                    }
                    else {
                        [_width, _height] = size;
                    }
                    const [_left, _top] = offset;
                    _minWidth = _left < _minWidth ? _left : _minWidth;
                    _minHeight = _top < _minHeight ? _top : _minHeight;
                    _maxWidth = (_left + _width) > _maxWidth ? (_left + _width) : _maxWidth;
                    _maxHeight = (_top + _height) > _maxHeight ? (_top + _height) : _maxHeight;

                    this.subfd[name]
                        .css('left', _left)
                        .css('top', _top)
                        .css('display', '');
                })() // push an IIFE, it returns a Promise
            );
        });
        await Promise.all(_lock); // wait all promise
        // when all draw complete
        // start animation
        console.log(_minWidth, _minHeight, _maxWidth, _maxHeight);
        const [_fullWidth, _fullHeight] = [_maxWidth - _minWidth, _maxHeight - _minHeight]
        const [_fullLeft, _fullTop] = [
            (_winW - _fullWidth) / 2 - _minWidth + this.current.left,
            (_winH - _fullHeight) / 2 - _minHeight + this.current.top
        ]
        // set main zoom, offset
        this.fd
            .css('left', _fullLeft)
            .css('top', _fullTop)
            .css('transform', `scale(${this.current.zoom / 100})`);

        this.previous = JSON.parse(JSON.stringify(this.current));
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

export default class YZLayerMgr {
    static Init() {
        YZLayer.Init();
        this.layers = {};
    }
    /**
     * Set a layer (new or existed)
     * @param {String} name 
     * @param {[{name: String,offset:[Number,Number],size:[Number,Number]}]} files 
     */
    static Set(name, files) {
        if (!this.layers[name]) {
            this.layers[name] = new YZLayer(name, files);
        }
        else {
            this.layers[name].SetSubLayer(files);
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
        this.layers[name].Show();
    }

    static Hide() {
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