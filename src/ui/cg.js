import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";
//import KRCSV from "../utils/krcsv";
export default class YZCG {
    static Init() {
        this.evfd = $('#evdiv');
        this.evbasefd = $('#evbase');
        this.evdifffd = $('#evdiff');
        this.datefd = $('#datediv');
        this.layerfd = $('#layerdiv');
        this.imageFormat = ".png";
        this.layerlast = {};
        this.cglist = [];
        this.diffdef = {};
        this.__LoadCGList();
    }

    static async __LoadCGList() {
        KRCSV.parse(await FilePath.read('evdiff.csv'), ',', null)
            .forEach(d =>
                this.diffdef[d[0]] = {
                    ev: d[0],
                    base: d[1],
                    diff: d[2],
                    offset: [d[3] || 0, d[4] || 0],
                    size: [d[5] || 1280, d[6] || 720]
                });

        let ls = FilePath.ls('evimage');
        delete ls.diff;
        Object.keys(ls) // base images
            //.filter(l => l.match(/ev([0-9]+[a-z]+)/i)[1]) // filter only cg
            .map(l => l.match(/ev[0-9]+[a-z]+/i)[0])
            .filter(l => l)
            .forEach(d =>
                this.diffdef[d] = {
                    ev: d,
                    base: d,
                    diff: null,
                    offset: [0, 0], // offset and size only apply on diff
                    size: [0, 0]
                });
        this.cglist = Object.keys(this.diffdef);
    }

    static NewLay(cmd) {
        let { name, option, param } = cmd;
        let lname = param.name;
        let lfile = param.file;

        let lfd = $(`#layer_${lname}`);
        if (lfd.length > 0) {
            lfd.remove();
        }
        if (!lfile) return;
        this.layerfd.append(
            $('<img>')
                .attr('id', `layer_${lname}`)
                .attr('src', FilePath.findMedia(lfile, 'image'))
        );

        this.layerlast[lname] = {
            x: 0,
            y: 0,
            zoom: 100
        }

        this.LayerCtl({
            name: lname,
            option: option,
            param: param
        });
        ObjectMapper.AddLayer(lname);
    }

    static DelLay(cmd) {
        try {
            $(`#layer_${cmd.param.name}`).remove();
            ObjectMapper.RemoveLayer(cmd.param.name);
        }
        catch{

        }
    }

    static async LayerCtl(cmd) {
        let { name, option, param } = cmd;

        let fd = $(`#layer_${name}`);
        let origx = parseInt(fd.get(0).naturalWidth);
        let origy = parseInt(fd.get(0).naturalHeight);
        if (origx + origy <= 0) {
            await new Promise((resolve, reject) => {
                fd.on('load', () => resolve());
                fd.on('error', () => reject());
            })
            origx = parseInt(fd.get(0).naturalWidth);
            origy = parseInt(fd.get(0).naturalHeight);
        }
        fd
            .off('load')
            .off('error');

        if (option.includes('show')) {
            fd.css('display', '')
        }
        if (option.includes('hide')) {
            fd.css('display', 'none')
        }

        let last = this.layerlast[name];

        // split a low level image lib?
        let x = (param.xpos !== undefined) ? param.xpos : last.x;
        let y = (param.ypos !== undefined) ? param.ypos : last.y;
        // TODO: coordinate convert
        let zoom = param.zoom || last.zoom;
        x = parseInt(x);
        y = parseInt(y);
        zoom = parseInt(zoom);
        this.layerlast[name] = { x, y, zoom }
        let rzoom = zoom / 100;

        let [curx, cury] = [origx * rzoom, origy * rzoom]
        let [cx, cy] = [curx / 2, cury / 2];
        let [offx, offy] = [640 - cx, 360 - cy];
        [offx, offy] = [offx + x, offy + y];
        fd
            .css('width', curx)
            .css('height', cury)
            .css('left', offx)
            .css('top', offy)
    }

    static EV(cmd) {
        let { name, option, param } = cmd;

        let evs = option.filter(o => this.cglist.includes(o));
        if (evs.length == 0) {
            evs = option.filter(o => FilePath.findMedia(o, 'image'));
            if (evs.length == 0) console.warn('CG.EV: no ev', cmd);
            else {
                this.evdifffd.css('display', 'none');
                this.evbasefd
                    .attr('src', FilePath.findMedia(evs[0], 'image'))
                    .css('display', '');
            }
        }
        else {
            let def = this.diffdef[evs[0]];
            this.evbasefd
                .attr('src', FilePath.findMedia(def.base.toUpperCase(), 'image'))
                .css('display', '');
            if (def.diff) {
                this.evdifffd
                    .attr('src', FilePath.findMedia(def.diff.toUpperCase(), 'image'))
                    .css('display', '')
                    .css('left', def.offset[0])
                    .css('top', def.offset[1])
                //.css('width', lszx)
                //.css('height', lszy);
            }
            else this.evdifffd.css('display', 'none');
        }

        if (option.includes('hide')) {
            this.evfd.css('display', 'none');
        }
        else
            this.evfd.css('display', '');
    }

    static Date(cmd) {
        let { name, option, param } = cmd;
    }
}
window.YZCG = YZCG;