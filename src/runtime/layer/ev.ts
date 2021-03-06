import LayerBase from "./base";
import KRCSV from "../../parser/krcsv";
import FilePath from "../../utils/filepath";

export default class LayerEV extends LayerBase {
    readonly zindex = 15;
    readonly channelName = "ev";
    private cglist: string[] = [];
    private diffdef: {
        [name: string]: {
            base: string,
            diff: string,
            ev: string,
            offset: Point,
            size: Point,
        },
    } = {};
    private cgName = "";
    public static Init() {
        this.GetInstance().__LoadCGList();
    }
    public static GetInstance(cmd?: KSFunc): LayerEV {
        if (this.instance === undefined) {
            this.instance = new LayerEV();
        }
        return this.instance;
    }
    private static instance: LayerEV = undefined;
    private async __LoadCGList() {
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
            .forEach(d => this.diffdef[d] = {
                ev: d,
                base: d,
                diff: undefined,
                offset: { x: 0, y: 0 }, // offset and size only apply on diff
                size: { x: 0, y: 0 },
            });
        this.cglist = Object.keys(this.diffdef);
    }
    CalculateName(cmd: KSFunc): string {
        return this.channelName;
    }
    CalculateSubLayer(cmd: KSFunc): LayerInfo[] {
        const { name, option, param } = cmd;
        let evs: string[] = (option).filter((o) => this.cglist.includes(o));
        if (evs.length === 0) {
            evs = (option).filter((o) => FilePath.findByType(o, "image"));
            if (evs.length === 0) {
                console.warn("CG.EV: no ev", cmd);
                return [];
            }
        }
        const def = this.diffdef[evs[0]];
        const layers = [];
        if (def) {
            if (def.base !== this.cgName) this.reload = true;
            this.cgName = def.base;
            layers.push({ name: def.base });
            if (def.diff) {
                layers.push({ name: def.diff, offset: def.offset });
            }
        } else {
            layers.push({ name: evs[0] });
        }
        return layers;
    }
}