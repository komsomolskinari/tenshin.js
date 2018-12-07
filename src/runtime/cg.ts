import ObjectMapper from "../objectmapper";
import YZLayerMgr from "../ui/layer";
import FilePath from "../utils/filepath";
import KRCSV from "../utils/krcsv";
export default class YZCG {
    public static Init() {
        this.__LoadCGList();
    }

    public static async __LoadCGList() {
        const [szx, szy] = Config.Display.WindowSize;
        KRCSV.parse(await FilePath.read(Config.Display.CGDiffFile), ",", null)
            .forEach((d) =>
                this.diffdef[d[0]] = {
                    ev: d[0],
                    base: d[1],
                    diff: d[2],
                    offset: { x: d[3] || 0, y: d[4] || 0 },
                    size: { x: d[5] || szx, y: d[6] || szy },
                });

        const ls = FilePath.ls(Config.Display.CGPath);
        delete ls.diff;
        Object.keys(ls) // base images
            .map((l) => l.match(/ev[0-9]+[a-z]+/i)[0])
            .filter((l) => l)
            .forEach((d) =>
                this.diffdef[d] = {
                    ev: d,
                    base: d,
                    diff: null,
                    offset: { x: 0, y: 0 }, // offset and size only apply on diff
                    size: { x: 0, y: 0 },
                });
        this.cglist = Object.keys(this.diffdef);
    }

    public static NewLay(cmd: KSLine) {
        const { name, option, param } = cmd;
        const lname = param.name as string;
        const lfile = param.file as string;
        if (!lfile) { return; }
        this.layerlast[lname] = {
            x: 0,
            y: 0,
            zoom: 100,
        };
        YZLayerMgr.Set(lname, [{ name: lfile, offset: { x: 0, y: 0 } }]);
        this.ProcessLay({
            name: lname,
            option,
            param,
        } as KSLine);
        ObjectMapper.AddLayer(lname);
    }

    public static DelLay(cmd: KSLine) {
        YZLayerMgr.Delete(cmd.param.name as string);
        ObjectMapper.RemoveLayer(cmd.param.name as string);
    }

    public static ProcessLay(cmd: KSLine) {
        const { name, option, param } = cmd;

        const last = this.layerlast[name];
        const x = (param.xpos !== undefined) ? param.xpos as number : last.x;
        const y = (param.ypos !== undefined) ? param.ypos as number : last.y;
        // TODO: coordinate convert
        const zoom = param.zoom as number || last.zoom;
        this.layerlast[name] = { x, y, zoom };
        YZLayerMgr.Zoom(name, zoom);
        YZLayerMgr.Move(name, { x, y });

        if (option.includes("show")) {
            YZLayerMgr.Show(name);
        }
        if (option.includes("hide")) {
            YZLayerMgr.Hide(name);
        }
        return { name, layer: [] as LayerInfo[] };
    }

    public static EV(cmd: KSLine) {
        const { name, option, param } = cmd;
        let evs: string[] = (option as string[]).filter((o) => this.cglist.includes(o));
        if (evs.length === 0) {
            evs = (option as string[]).filter((o) => FilePath.findMedia(o, "image"));
            if (evs.length === 0) {
                console.warn("CG.EV: no ev", cmd);
                return;
            }
        }
        const def = this.diffdef[evs[0]];
        const layers = [];
        if (def) {
            layers.push({ name: def.base });
            if (def.diff) {
                layers.push({ name: def.diff, offset: def.offset });
            }
        } else {
            layers.push({ name: evs[0] });
        }
        YZLayerMgr.Set("background", layers);
        if (option.includes("hide")) { YZLayerMgr.Hide("background"); } else { YZLayerMgr.Show("background"); }
    }
    private static layerlast: {
        [name: string]: {
            x: number,
            y: number,
            zoom: number,
        },
    } = {};
    private static cglist: string[] = [];
    private static diffdef: {
        [name: string]: {
            base: string,
            diff: string,
            ev: string,
            offset: Point,
            size: Point,
        },
    } = {};
}
