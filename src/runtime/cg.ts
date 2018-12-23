import ObjectMapper from "../objectmapper";
import YZLayer from "../ui/layer";
import FilePath from "../utils/filepath";
import KRCSV from "../utils/krcsv";
export default class YZCG {
    private static cgName = "";
    private static daytime: any = undefined;
    private static stage: any = undefined;
    private static bgname = "background";
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

    static Init() {
        this.__LoadCGList();
    }

    public static async __LoadCGList() {
        const [szx, szy] = Config.Display.WindowSize;
        KRCSV.parse(await FilePath.read(Config.Display.CGDiffFile), ",", undefined)
            .forEach(d =>
                this.diffdef[d[0]] = {
                    ev: d[0],
                    base: d[1],
                    diff: d[2],
                    offset: { x: parseInt(d[3]) || 0, y: parseInt(d[4]) || 0 },
                    size: { x: parseInt(d[5]) || szx, y: parseInt(d[6]) || szy },
                });

        const ls = FilePath.ls(Config.Display.CGPath);
        delete ls.diff;
        Object.keys(ls) // base images
            .map(l => l.match(/ev[0-9]+[a-z]+/i)[0])
            .filter(l => l)
            .forEach(d =>
                this.diffdef[d] = {
                    ev: d,
                    base: d,
                    diff: undefined,
                    offset: { x: 0, y: 0 }, // offset and size only apply on diff
                    size: { x: 0, y: 0 },
                });
        this.cglist = Object.keys(this.diffdef);
    }

    static SetDaytime(time: any): LayerControlData {
        if (ObjectMapper.TypeOf(time) === "times") {
            this.daytime = ObjectMapper.GetProperty(time);
        }
        return { name: this.bgname, layer: [] };
    }

    static ProcessBG(cmd: KSFunc): LayerControlData {
        const { name, option, param } = cmd;
        this.stage = ObjectMapper.GetProperty(name);

        // inline time
        const inlineTime = (option.filter(o => ObjectMapper.TypeOf(o as string) === "times") || [])[0];
        if (inlineTime) {
            this.SetDaytime(inlineTime);
        }
        let reload = false;
        if (this.stage.image !== this.cgName) reload = true;
        this.cgName = this.stage.image;
        return { name: this.bgname, layer: [{ name: this.stage.image.replace("TIME", this.daytime.prefix) }], reload };
    }

    public static NewLay(cmd: KSFunc): LayerControlData {
        const { name, option, param } = cmd;
        const lname = param.name as string;
        const lfile = param.file as string;
        if (!lfile) { return; }
        ObjectMapper.AddLayer(lname);
        return { name: lname, layer: [{ name: lfile }] };
    }

    public static DelLay(cmd: KSFunc): LayerControlData {
        YZLayer.Unset(cmd.param.name as string);
        ObjectMapper.RemoveLayer(cmd.param.name as string);
        return undefined;
    }

    public static ProcessEV(cmd: KSFunc): LayerControlData {
        const { name, option, param } = cmd;
        let evs: string[] = (option as string[]).filter((o) => this.cglist.includes(o));
        if (evs.length === 0) {
            evs = (option as string[]).filter((o) => FilePath.findMedia(o, "image"));
            if (evs.length === 0) {
                console.warn("CG.EV: no ev", cmd);
                return { name: "background", layer: [] };
            }
        }
        const def = this.diffdef[evs[0]];
        const layers = [];
        let reload = false;
        if (def) {
            if (def.base !== this.cgName) reload = true;
            this.cgName = def.base;
            layers.push({ name: def.base });
            if (def.diff) {
                layers.push({ name: def.diff, offset: def.offset });
            }
        } else {
            layers.push({ name: evs[0] });
        }
        return { name: "background", layer: layers, reload };
    }

}
