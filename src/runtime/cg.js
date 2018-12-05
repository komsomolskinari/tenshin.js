import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";
import KRCSV from "../utils/krcsv";
import YZLayerMgr from "../ui/layer";
export default class YZCG {
    static Init() {
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
        return { name: name, layer: [] };
    }

    static EV(cmd) {
        let { name, option, param } = cmd;
        let evs = option.filter(o => this.cglist.includes(o));
        if (evs.length == 0) {
            evs = option.filter(o => FilePath.findMedia(o, 'image'));
            if (evs.length == 0) {
                console.warn('CG.EV: no ev', cmd);
                return;
            }
        }
        let def = this.diffdef[evs[0]];
        let layers = [];
        if (def) {
            layers.push({ name: def.base });
            if (def.diff) {
                layers.push({ name: def.diff, offset: def.offset });
            }
        }
        else {
            layers.push({ name: evs[0] });
        }
        YZLayerMgr.Set('background', layers);
        if (option.includes('hide')) YZLayerMgr.Hide('background');
        else YZLayerMgr.Show('background');
    }
}
window.YZCG = YZCG;