import ObjectMapper from "../../objectmapper";
import YZSound from "../../ui/sound";
import YZText from "../../ui/text";
import FilePath from "../../utils/filepath";
import KRCSV from "../../utils/krcsv";
import { KAGConst } from "../../const";
import LayerBase from "./base";

interface LayerCharaDress {
    [dressname: string]: {
        [subvariant: string]: {
            name: string;
            prefix: string;
        }
    };
}
interface LayerCharaFace {
    [variant: string]: {
        [faceid: string]: string[];
    };
}

interface LayerCharaCoord {
    [variant: string]: {
        [subvariant: string]: {
            [layername: string]: {
                name: string;
                offset: Point;
                size: Point;
            }
        }
    };
}

export default class LayerChara extends LayerBase {
    readonly zindex = 20;
    static voiceBase = "";
    private name: string;
    private currentVoice = 1;
    private nextVoice: string;
    private voiceFmt: string;
    private displayName: string;

    dress: LayerCharaDress = {};
    face: LayerCharaFace = {};
    coord: LayerCharaCoord = {};
    imageLevel = 1;
    imageXPos = 0;
    dispPos: string = KAGConst.Both;
    showedInDom = false;
    dressOpt = "";

    static characters: {
        [name: string]: LayerChara
    } = {};
    static Init() {
        Object.keys(ObjectMapper.innerobj.characters)
            .forEach(c => new LayerChara(c));
    }
    static GetInstance(cmd?: KSFunc): LayerChara {
        return this.characters[cmd.name];
    }
    constructor(name?: string) {
        super();
        this.name = name;
        this.currentVoice = 1;
        this.voiceFmt = ObjectMapper.GetProperty(name).voiceFile;
        this.displayName = ObjectMapper.GetProperty(name).standName;

        LayerChara.characters[name] = this;
        // if character has no image, skip image meta
        const fgLs = FilePath.ls(`${Config.Display.CharacterPath}/${name}`);
        if (fgLs !== undefined) this.__LoadImageInfo(fgLs);
    }

    async __LoadImageInfo(list: IndexItem) {
        const files = Object.keys(list);
        // load all data, limit rate here, or it will block pipe
        files.filter(f => f.match(/info\.txt$/)).forEach(f => this.__LoadChunk(f));
        files.filter(f => f.match(/[0-9]\.txt$/)).forEach(f => this.__LoadCoord(f));
    }
    async __LoadChunk(filename: string) {
        const chunkDefs = KRCSV.parse(await FilePath.read(filename), "\t", false);
        const _fsp = filename.split("_");
        const pfx = _fsp.slice(0, _fsp.length - 1).join("_");
        if (this.face[pfx] === undefined) {
            this.face[pfx] = {};
        }
        chunkDefs.filter(def => def.length === 5).forEach(def => {
            const [, dname, , dno, dvstr] = def;
            if (this.dress[dname] === undefined) {
                this.dress[dname] = {};
            }
            this.dress[dname][dno] = { name: dvstr, prefix: pfx };
        });
        chunkDefs.filter(def => def.length === 4).forEach(def => {
            const [, fno, , fvstr] = def;
            if (this.face[pfx][fno] === undefined) {
                this.face[pfx][fno] = [];
            }
            this.face[pfx][fno].push(fvstr);
        });
    }
    async __LoadCoord(filename: string) {
        const coordDefs = KRCSV.parse(await FilePath.read(filename), "\t");
        const fvar = filename.match(/_([0-9])\./)[1];
        const _fsp = filename.split("_");
        const pfx = _fsp.slice(0, _fsp.length - 1).join("_");
        if (this.coord[pfx] === undefined) {
            this.coord[pfx] = {};
        }
        if (this.coord[pfx][fvar] === undefined) {
            this.coord[pfx][fvar] = {};
        }
        coordDefs.forEach(def => {
            const [, lname, loffx, loffy, lsizex, lsizey, , , , lid] = def;
            this.coord[pfx][fvar][lname] = {
                // type sensitive
                offset: { x: parseInt(loffx), y: parseInt(loffy) },
                size: { x: parseInt(lsizex), y: parseInt(lsizey) },
                name: lid
            };
        });
    }

    /**
     * CalculateSubLayer, had side effect
     * @param cmd command
     */
    CalculateSubLayer(cmd: KSFunc): LayerControlData {
        const { name, option, param } = cmd;
        if (name !== this.name) return;
        // let upper runtime handle this, it's public option
        if (param.delayrun) return;
        // first, voice option:
        if (param.voice) {
            if (!isNaN(parseInt(param.voice as string))) {
                this.currentVoice = parseInt(param.voice as string);
            }
            else {
                this.nextVoice = param.voice as string;
            }
        }
        const ret = this.ProcessImageCmd(cmd.option); // LayerChara.ProcessImage(cmd);
        if (!ret) debugger;
        return ret;
    }

    private ProcessImageCmd(option: string[]): LayerControlData {
        if (this.displayName && this.displayName !== this.name) {
            LayerChara.GetInstance({ name: this.displayName } as KSFunc).ProcessImageCmd(option);
        }
        const usedVer = this.RefreshImageLevel(option);
        const allDress = Object.keys(this.dress);
        const dOpt = option.filter(o => allDress.includes(o))[0];
        if (dOpt) {
            this.dressOpt = dOpt;
        }
        const fOpt = option.filter(o => o.match(/^[0-9]{3}$/) !== null)[0];
        let imgctl: LayerInfo[] = [];
        if (fOpt) {
            // select image
            const mainId = fOpt.substr(0, 1);
            const varId = fOpt.substr(1, 2).match(/([1-9][0-9]?)/)[1];

            if (!this.dressOpt) this.dressOpt = Object.keys(this.dress)[0];
            const { name: mainImg, prefix: pfx } = this.dress[this.dressOpt][mainId];
            const varImg = this.face[pfx][varId];
            if (varImg === undefined) return;
            const vImgs: LayerInfo[] = varImg
                .map(v => this.coord[pfx][usedVer][v]);
            const mImg = this.coord[pfx][usedVer][mainImg];
            imgctl = ([mImg] as LayerInfo[]).concat(vImgs)
                // transform names
                .map(v => ({
                    name: ([pfx, usedVer, v.name].join("_")),
                    offset: v.offset,
                    size: v.size,
                }));
        }
        return { name: this.name, layer: imgctl };
    }

    private RefreshImageLevel(option: string[]) {
        const mapped = ObjectMapper.ConvertAll(option);
        (mapped.positions || []).forEach((p: any) => {
            if (p.type === KAGConst.Level) this.imageLevel = parseInt(p.level);
        });
        // 35 50 75 100 120 140 bgexpand original
        // WATCHOUT! Magic here!
        return ([1, 1, 3, 3, 5, 5, 3])[this.imageLevel];
    }

    CalculatePosition(cmd: KSFunc): Point {
        const level = this.RefreshImageLevel(cmd.option);
        const fix = [0, 100, 0, 300, 0, 500][level]; // WATCHOUT! Magic here!
        console.log(`Center adjust ${fix}`);
        const r = super.CalculatePositionWithPZoom(cmd, 0.5);
        r.y = r.y || 0 + fix;
        console.log(r);
        return r;
    }

    CalculateSize(cmd: KSFunc): Point {
        const option = cmd.option;
        if (this.displayName && this.displayName !== this.name) {
            LayerChara.GetInstance({ name: this.displayName } as KSFunc).ProcessImageCmd(option);
        }
        const usedVer = this.RefreshImageLevel(option);
        const allDress = Object.keys(this.dress);
        const dOpt = option.filter(o => allDress.includes(o))[0];
        if (dOpt) {
            this.dressOpt = dOpt;
        }
        const fOpt = option.filter(o => o.match(/^[0-9]{3}$/) !== null)[0];
        if (fOpt) {
            // select image
            const mainId = fOpt.substr(0, 1);
            if (!this.dressOpt) this.dressOpt = Object.keys(this.dress)[0];
            const pfx = this.dress[this.dressOpt][mainId].prefix;
            return this.coord[pfx][usedVer].undefined.size;
        }
        return;
    }

    Text(text: string, display: string) {
        // display name haven't been rewrite, need set
        if (!display) {
            if (this.displayName) display = this.displayName;
            else display = this.name;
        }
        this.Voice();
        YZText.Print(text, display);
    }

    /**
     * @param seq Alternate seq id
     */
    Voice(seq?: string) {
        let stxt;
        if (this.nextVoice) {
            stxt = this.nextVoice;
            this.nextVoice = undefined;
        }
        else {
            if (!this.voiceFmt) return;
            let s;
            if (isNaN(parseInt(seq)) && seq !== undefined) {
                s = seq;
            }
            else { // number or undefined, ignore arg seq
                s = this.currentVoice;
                this.currentVoice++;
            }
            stxt = s;
            if (!isNaN(parseInt(s as string))) {
                stxt = this.voiceFmt;
                // TODO: real printf
                stxt = stxt
                    .replace("%s", LayerChara.voiceBase)
                    .replace("%03d", String(s).padStart(3, "0"));
            }
        }
        // drop extension
        stxt = (stxt as string).replace(/\.[a-z0-9]{2,5}$/i, "");
        YZSound.Voice(stxt);
    }
}
