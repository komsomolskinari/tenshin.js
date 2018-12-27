import LayerBase from "./layerbase";
import ObjectMapper from "../objectmapper";
import KRCSV from "../utils/krcsv";
import FilePath from "../utils/filepath";

export default class LayerCG extends LayerBase {
    readonly positionZoom = 0.3;
    public static Init() {
        this.GetInstance().__LoadCGList();
    }
    public static GetInstance(cmd?: KSFunc): LayerCG {
        if (this.instance === undefined) {
            this.instance = new LayerCG();
        }
        return this.instance;
    }
    private static instance: LayerCG = undefined;

    private cgName = "";
    private daytime: any = undefined;
    private stage: any = undefined;
    private bgname = "background";
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

    CalculateSubLayer(cmd: KSFunc): LayerControlData {
        switch (ObjectMapper.TypeOf(cmd.name)) {
            case "stages":
                break;
            case "times":
                this.daytime = ObjectMapper.GetProperty(cmd.name);
                return { name: this.bgname, layer: [] };
                break;
            case "layer":
                break;
        }
    }

    private ProcessBG(cmd: KSFunc): LayerControlData {
        const { name, option, param } = cmd;
        this.stage = ObjectMapper.GetProperty(name);

        // inline time
        const inlineTime = (option.filter(o => ObjectMapper.TypeOf(o as string) === "times") || [])[0];
        if (inlineTime) {
            this.daytime = ObjectMapper.GetProperty(inlineTime);
        }
        let reload = false;
        if (this.stage.image !== this.cgName) reload = true;
        this.cgName = this.stage.image;
        return { name: this.bgname, layer: [{ name: this.stage.image.replace("TIME", this.daytime.prefix) }], reload };
    }

    private ProcessEV(cmd: KSFunc): LayerControlData {
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
