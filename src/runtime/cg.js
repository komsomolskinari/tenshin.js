import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";
import KRCSV from "../utils/krcsv";
import YZLayerMgr from "../ui/layer";
export default class YZCG {
    static Init() {
        this.evfd = $('#evdiv');
        this.evbasefd = $('#evbase');
        this.evdifffd = $('#evdiff');
        this.datefd = $('#datediv');
        this.layerfd = $('#layerdiv');
        this.layerlast = {};
        this.cglist = [];
        this.diffdef = {};
        this.__LoadCGList();
    }

    static async __LoadCGList() {
        const [szx, szy] = Config.Display.WindowSize;
        KRCSV.parse(await FilePath.read(Config.Display.CGDiffFile), ',', null)
            .forEach(d =>
                this.diffdef[d[0]] = {
                    ev: d[0],
                    base: d[1],
                    diff: d[2],
                    offset: [d[3] || 0, d[4] || 0],
                    size: [d[5] || szx, d[6] || szy]
                });

        let ls = FilePath.ls(Config.Display.CGPath);
        delete ls.diff;
        Object.keys(ls) // base images
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
        if (!lfile) return;
        this.layerlast[lname] = {
            x: 0,
            y: 0,
            zoom: 100
        }
        YZLayerMgr.Set(lname, [{ name: lfile, offset: [0, 0] }]);
        this.ProcessLay({
            name: lname,
            option: option,
            param: param
        });
        ObjectMapper.AddLayer(lname);
    }

    static DelLay(cmd) {
        YZLayerMgr.Delete(cmd.param.name);
        ObjectMapper.RemoveLayer(cmd.param.name);
    }

    static ProcessLay(cmd) {
        let { name, option, param } = cmd;

        let last = this.layerlast[name];
        let x = (param.xpos !== undefined) ? param.xpos : last.x;
        let y = (param.ypos !== undefined) ? param.ypos : last.y;
        // TODO: coordinate convert
        let zoom = param.zoom || last.zoom;
        x = parseInt(x);
        y = parseInt(y);
        zoom = parseInt(zoom);
        this.layerlast[name] = { x, y, zoom };
        YZLayerMgr.Zoom(name, zoom);
        YZLayerMgr.Move(name, x, y);

        if (option.includes('show')) {
            YZLayerMgr.Show(name);
        }
        if (option.includes('hide')) {
            YZLayerMgr.Hide(name);
        }
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