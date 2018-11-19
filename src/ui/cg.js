import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";
//import KRCSV from "../utils/krcsv";
export default class YZCG {
    static Init() {
        this.evfd = $('#evdiv');
        this.datefd = $('#datediv');
        this.layerfd = $('#layerdiv');
        this.imageFormat = ".png";
        this.layerlast = {};
        this.cglist = [];
        this.diffdef = {};
        this.basefmt = 'EV%U%.png';
        this.difffmt = 'diff_ev%l%.png';
        this.__LoadCGList();
    }

    static async __LoadCGList() {
        KRCSV.Parse(await $.get(FilePath.find('evdiff.csv')), ',', null)
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
            .map(l => l.match(/ev([0-9]+[a-z]+)/i)[1]) // filter only cg
            .forEach(d =>
                this.diffdef[d[0]] = {
                    ev: d[0],
                    base: d[0],
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
        this.layerfd.append(
            $('<img>')
                .attr('id', `layer_${lname}`)
                .attr('src', FilePath.find(lfile + this.imageFormat))
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
        $(`#layer_${cmd.param.name}`).remove();
        ObjectMapper.RemoveLayer(cmd.param.name);
    }

    static async LayerCtl(cmd) {
        console.log('layerctl', cmd);
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
        console.log(cmd);
        if (option.includes('hide')) {
            console.log('hide ev');
            return;
        }

        let evs = option.filter(o => this.cglist.includes(o));
        if (evs.length == 0) {
            evs = option.filter(o => FilePath.find(o + '.png'));
            if (evs.length == 0) console.log(`no ev, ${cmd}`);
            else console.log(`cg ev ${evs[0]}`)
        }
        else {
            let def = this.diffdef[evs[0]];
            console.log(`ev ${def.ev},base ${def.base},diff ${def.diff}`);
        }
    }

    static Date(cmd) {
        let { name, option, param } = cmd;
    }
}