import ObjectMapper from "../objectmapper";
import YZSound from "../ui/sound";
import YZText from "../ui/text";
import FilePath from "../utils/filepath";
import KRCSV from "../utils/krcsv";
import YZLayerMgr from "../ui/layer";
import { KAGConst } from "../const";

const X = 0;
const WIDTH = 0;
const HORIZONTAL = 0;
const Y = 1;
const HEIGHT = 1;
const VERTICAL = 1;

export default class Character {
    static voiceBase = "";
    static characters: {
        [name: string]: Character
    } = {};

    private name: string;
    private currentVoice = 1;
    private nextVoice: string = undefined;
    private voiceFmt: string;
    private displayName: string;

    dress: {
        [dressname: string]: {
            [subvariant: string]: string[]
        }
    } = {};
    face: {
        [variant: string]: {
            [faceid: string]: string[]
        }
    } = {};
    coord: {
        [variant: string]: {
            [subvariant: string]: {
                [layername: string]: {
                    layer: string,
                    offset: Point,
                    size: Point
                }
            }
        }
    } = {};

    imageLevel = 1;
    imageXPos = 0;
    dispPos: string = KAGConst.Both;
    showedInDom = false;
    dressOpt = "";

    constructor(name: string) {
        this.name = name;
        this.currentVoice = 1;
        this.nextVoice = undefined;
        this.voiceFmt = ObjectMapper.GetProperty(name).voiceFile;
        this.displayName = ObjectMapper.GetProperty(name).standName;
        // if character has no image, skip image meta
        const fgLs = FilePath.ls(`${Config.Display.CharacterPath}/${name}`);
        this.dress = {};
        this.face = {};
        this.coord = {};

        this.imageLevel = 1;
        this.imageXPos = 0;
        this.dispPos = KAGConst.Both;
        this.showedInDom = false;
        this.dressOpt = "";
        Character.characters[name] = this;
        if (fgLs !== undefined) this.__LoadImageInfo(fgLs);
    }

    async __LoadImageInfo(list: IndexItem) {
        const files = Object.keys(list);
        // load all data, limit rate here, or it will block pipe
        const pms = [];
        files.filter(f => f.match(/info\.txt$/)).forEach(f => pms.push(this.__LoadChunk(f)));
        files.filter(f => f.match(/[0-9]\.txt$/)).forEach(f => pms.push(this.__LoadCoord(f)));
    }

    async __LoadChunk(filename: string) {
        const f = KRCSV.parse(await FilePath.read(filename), "\t", false);
        const _fsp = filename.split("_");
        const pfx = _fsp.slice(0, _fsp.length - 1).join("_");

        if (this.face[pfx] === undefined) {
            this.face[pfx] = {};
        }

        f.filter(l => l.length === 5).forEach(l => {
            const [, dname, , dno, dvstr] = l;
            if (this.dress[dname] === undefined) {
                this.dress[dname] = {};
            }
            this.dress[dname][dno] = [dvstr, pfx];
        });
        f.filter(l => l.length === 4).forEach(l => {
            const [, fno, , fvstr] = l;
            if (this.face[pfx][fno] === undefined) {
                this.face[pfx][fno] = [];
            }
            this.face[pfx][fno].push(fvstr);
        });
    }

    async __LoadCoord(filename: string) {
        const f = KRCSV.parse(await FilePath.read(filename), "\t");
        const fvar = filename.match(/_([0-9])\./)[1];
        const _fsp = filename.split("_");
        const pfx = _fsp.slice(0, _fsp.length - 1).join("_");

        if (this.coord[pfx] === undefined) {
            this.coord[pfx] = {};
        }
        if (this.coord[pfx][fvar] === undefined) {
            this.coord[pfx][fvar] = {};
        }

        f.forEach(l => {
            const [, lname, loffx, loffy, lsizex, lsizey, , , , lid] = l;
            this.coord[pfx][fvar][lname] = {
                offset: { x: loffx, y: loffy },
                size: { x: lsizex, y: lsizey },
                layer: lid
            };
        });
    }

    //
    // o- nextvoice: generate a new voice channel, play voice, delete it
    // o- stopvoice: ?
    // o- bvoice: set to bvoice channel/ clear bvoice channel
    // -p [x]voice: modify next voice, if number, change curVoice
    // -p [?]delayrun: do it when voice play to arg
    // o- [?]sync: sync with what?
    Process(cmd: KSLine) {
        const { name, option, param } = cmd;
        if (name !== this.name) return;

        // let upper runtime handle this, it's public option
        // delayrun: just set a delay to timeline
        // TODO: use eventlistener to channel instead of cmd
        // or calculate
        if (param.delayrun) {
            // delete cmd.param.delayrun;
            // console.debug('Delay exec command', cmd);
            // AsyncTask.Add(() => this.Process(cmd), undefined, 2000);
            return;
        }

        // first, voice option:
        if (param.voice) {
            if (!isNaN(parseInt(param.voice as string))) {
                this.currentVoice = parseInt(param.voice as string);
            }
            else {
                this.nextVoice = param.voice as string;
            }
        }

        const mapped: {
            [key: string]: any
        } = {};
        option.filter(o => ObjectMapper.IsProperty(o as string)).forEach(o => {
            const t = ObjectMapper.TypeOf(o as string);
            if (mapped[t] === undefined) mapped[t] = [];
            const mo = ObjectMapper.GetProperty(o as string);
            if (mo.length === undefined) {
                mapped[t].push(mo);
            }
            else {
                for (const i of mo) {
                    mapped[t].push(i);
                }
            }
        });

        (mapped.positions || []).forEach((p: any) => {
            switch (p.type) {
                case KAGConst.DispPosition:
                    this.dispPos = p.disp;
                    break;
                case KAGConst.XPosition:
                    this.imageXPos = parseInt(p.xpos);
                    this.dispPos = KAGConst.Both; // ?? 1.ks 1865, should we do this?
                    break;
                case KAGConst.Level:
                    this.imageLevel = parseInt(p.level);
                    break;
                default:
                    break;
            }
        });
        // if standName !== name, we need call another character's Image()
        // TODO: Update imageLevel, imageXPos

        let runner: Character = Character.characters[this.name];
        if (this.displayName && this.displayName !== this.name) {
            const dispch = Character.characters[this.displayName];
            if (dispch) runner = dispch;
        }
        return runner.ProcessImageCmd(option);
    }

    async ProcessImageCmd(option: any[]) {
        const allDress = Object.keys(this.dress);
        const dOpt = option.filter(o => allDress.includes(o))[0];
        if (dOpt) {
            this.dressOpt = dOpt;
        }
        const fOpt = option.filter(o => o.match(/^[0-9]{3}$/) !== null)[0];
        let imgctl: LayerInfo[] = [];
        if (fOpt) {
            imgctl = this.Image(fOpt);
        }
        if ([KAGConst.Both, KAGConst.BU].includes(this.dispPos as KAGConst)) {
            this.showedInDom = true;
            await YZLayerMgr.Set(this.name, imgctl, "characters");
        }
        else {
            this.showedInDom = false;
            YZLayerMgr.Hide(this.name);
        }
        YZLayerMgr.Draw(this.name);
        return { name: this.name, layer: imgctl };
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
     *
     * @param {*} seq Alternate seq id, only apply non-nuber
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
                    .replace("%s", Character.voiceBase)
                    .replace("%03d", String(s).padStart(3, "0"));
            }
        }
        // drop extension
        stxt = (stxt as string).replace(/\.[a-z0-9]{2,5}$/i, "");
        YZSound.Voice(stxt);
    }

    Image(faceOpt: string) {
        // select image
        const mainId = faceOpt.substr(0, 1);
        const varId = faceOpt.substr(1, 2);

        if (!this.dressOpt) this.dressOpt = Object.keys(this.dress)[0];
        const i = this.dress[this.dressOpt][mainId];
        if (!i) debugger;
        const [mainImg, pfx] = i;
        const varImg = this.face[pfx][varId];
        if (varImg === undefined) return;
        // 35 50 75 100 120 140 bgexpand original
        const usedVer = ([1, 1, 3, 3, 3, 5, 3])[this.imageLevel];

        const vImgs: LayerInfo[] = varImg
            .map(v => this.coord[pfx][usedVer][v])
            .map(v => {
                return {
                    name: v.layer,
                    offset: v.offset,
                    size: v.size,
                };
            });
        const mImg = this.coord[pfx][usedVer][mainImg];
        let ctl: LayerInfo[] = [{
            name: mImg.layer,
            offset: mImg.offset,
            size: mImg.size,
        }];
        ctl = ctl
            .concat(vImgs)
            .map((v: LayerInfo) => {
                return {
                    name: ([pfx, usedVer, v.name].join("_")),
                    offset: v.offset,
                    size: v.size,
                };
            });
        // zoom each layer
        // emmmm, not now...
        return ctl;
    }
}
