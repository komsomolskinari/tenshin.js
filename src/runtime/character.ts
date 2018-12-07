import ObjectMapper from "../objectmapper";
import YZSound from "../ui/sound";
import YZText from "../ui/text";
import AsyncTask from "../async/asynctask";
import FilePath from "../utils/filepath";
import KRCSV from "../utils/krcsv";
import YZLayerMgr from "../ui/layer";
const X = 0;
const WIDTH = 0;
const HORIZONTAL = 0;
const Y = 1;
const HEIGHT = 1;
const VERTICAL = 1;
const KAGConst = {
    Both: "KAGEnvImage.BOTH",
    BU: "KAGEnvImage.BU",
    Clear: "KAGEnvImage.CLEAR",
    Face: "KAGEnvImage.FACE",
    Invisible: "KAGEnvImage.INVISIBLE",
    DispPosition: "KAGEnvironment.DISPPOSITION",
    XPosition: "KAGEnvironment.XPOSITION",
    Level: "KAGEnvironment.LEVEL"
}
export default class Character {

    static voiceBase = "";
    static characters: {
        [name: string]: Character
    } = {}

    name: string;
    currentVoice: number = 1;
    nextVoice: string = undefined;
    voiceFmt: string;
    displayName: string;

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
                    offset: [number, number],
                    size: [number, number]
                }
            }
        }
    } = {};

    imageLevel: number = 1;
    imageXPos: number = 0;
    dispPos: string = KAGConst.Both;
    showedInDom: boolean = false;
    dressOpt: string = "";


    constructor(name: string) {
        this.name = name;
        this.currentVoice = 1;
        this.nextVoice = undefined;
        this.voiceFmt = ObjectMapper.GetProperty(name).voiceFile;
        this.displayName = ObjectMapper.GetProperty(name).standName;
        // if character has no image, skip image meta
        let fgLs = FilePath.ls(`${Config.Display.CharacterPath}/${name}`);
        this.dress = {};
        this.face = {};
        this.coord = {};

        this.imageLevel = 1;
        this.imageXPos = 0;
        this.dispPos = KAGConst.Both;
        this.showedInDom = false;
        this.dressOpt = "";
        Character.characters[name] = this;
        if (fgLs != undefined) this.__LoadImageInfo(fgLs);
    }

    async __LoadImageInfo(list: IndexItem) {
        let files = Object.keys(list);
        // load all data, limit rate here, or it will block pipe
        let pms = [];
        files.filter(f => f.match(/info\.txt$/)).forEach(f => pms.push(this.__LoadChunk(f)));
        files.filter(f => f.match(/[0-9]\.txt$/)).forEach(f => pms.push(this.__LoadCoord(f)));
    }

    async __LoadChunk(filename: string) {
        const f = KRCSV.parse(await FilePath.read(filename), '\t', false);
        const _fsp = filename.split('_');
        const pfx = _fsp.slice(0, _fsp.length - 1).join('_');

        if (this.face[pfx] === undefined)
            this.face[pfx] = {};

        f.filter(l => l.length == 5).forEach(l => {
            let [, dname, , dno, dvstr] = l;
            if (this.dress[dname] === undefined)
                this.dress[dname] = {};
            this.dress[dname][dno] = [dvstr, pfx];
        })
        f.filter(l => l.length == 4).forEach(l => {
            let [, fno, , fvstr] = l;
            if (this.face[pfx][fno] == undefined)
                this.face[pfx][fno] = [];
            this.face[pfx][fno].push(fvstr);
        })
    }

    async __LoadCoord(filename: string) {
        let f = KRCSV.parse(await FilePath.read(filename), '\t');
        const fvar = filename.match(/_([0-9])\./)[1];
        const _fsp = filename.split('_');
        const pfx = _fsp.slice(0, _fsp.length - 1).join('_');

        if (this.coord[pfx] === undefined)
            this.coord[pfx] = {};
        if (this.coord[pfx][fvar] === undefined)
            this.coord[pfx][fvar] = {};

        f.forEach(l => {
            const [, lname, loffx, loffy, lsizex, lsizey, , , , lid] = l;
            this.coord[pfx][fvar][lname] = {
                offset: [loffx, loffy],
                size: [lsizex, lsizey],
                layer: lid
            };
        })
    }

    //
    // o- nextvoice: generate a new voice channel, play voice, delete it
    // o- stopvoice: ?
    // o- bvoice: set to bvoice channel/ clear bvoice channel
    // -p [x]voice: modify next voice, if number, change curVoice
    // -p [?]delayrun: do it when voice play to arg
    // o- [?]sync: sync with what?
    Process(cmd: KSLine) {
        let { name, option, param } = cmd;
        if (name !== this.name) return;

        // let upper runtime handle this, it's public option
        // delayrun: just set a delay to timeline
        // TODO: use eventlistener to channel instead of cmd
        // or calculate
        if (param.delayrun) {
            //delete cmd.param.delayrun;
            //console.debug('Delay exec command', cmd);
            //AsyncTask.Add(() => this.Process(cmd), undefined, 2000);
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

        let mapped: {
            [key: string]: any
        } = {};
        option.filter(o => ObjectMapper.IsProperty(o as string)).forEach(o => {
            let t = ObjectMapper.TypeOf(o as string);
            if (mapped[t] === undefined) mapped[t] = [];
            let mo = ObjectMapper.GetProperty(o as string);
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
        })
        // if standName !== name, we need call another character's Image()
        // TODO: Update imageLevel, imageXPos

        let runner: Character = this
        if (this.displayName && this.displayName !== this.name) {
            let dispch = Character.characters[this.displayName];
            if (dispch) runner = dispch;
        }
        return runner.ProcessImageCmd(option);
    }

    async ProcessImageCmd(option: any[]) {
        let allDress = Object.keys(this.dress);
        let dOpt = option.filter(o => allDress.includes(o))[0];
        if (dOpt) {
            this.dressOpt = dOpt;
        }
        let fOpt = option.filter(o => o.match(/^[0-9]{3}$/) != null)[0];
        let imgctl: LayerInfo[] = [];
        if (fOpt) {
            imgctl = this.Image(fOpt);
        }
        if ([KAGConst.Both, KAGConst.BU].includes(this.dispPos)) {
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
                    .replace('%s', Character.voiceBase)
                    .replace('%03d', String(s).padStart(3, '0'));
            }
        }
        // drop extension
        stxt = (stxt as string).replace(/\.[a-z0-9]{2,5}$/i, '');
        YZSound.Voice(stxt);
    }

    Image(faceOpt: string) {
        // select image
        let mainId = faceOpt.substr(0, 1);
        let varId = faceOpt.substr(1, 2);

        if (!this.dressOpt) this.dressOpt = Object.keys(this.dress)[0];

        let [mainImg, pfx] = this.dress[this.dressOpt][mainId];
        let varImg = this.face[pfx][varId];
        if (varImg === undefined) return;
        // 35 50 75 100 120 140 bgexpand original
        const usedVer = ([1, 1, 3, 3, 3, 5, 3])[this.imageLevel];

        let vImgs: LayerInfo[] = varImg
            .map(v => this.coord[pfx][usedVer][v])
            .map(v => {
                return {
                    name: v.layer,
                    offset: { x: v.offset[0], y: v.offset[1] },
                    size: { x: v.size[0], y: v.size[1] },
                }
            });
        let mImg = this.coord[pfx][usedVer][mainImg];
        let ctl: LayerInfo[] = [{
            name: mImg.layer,
            offset: { x: mImg.offset[0], y: mImg.offset[1] },
            size: { x: mImg.size[0], y: mImg.size[1] },
        }];
        ctl = ctl
            .concat(vImgs)
            .map((v: LayerInfo) => {
                return {
                    name: ([pfx, usedVer, v.name].join('_')),
                    offset: v.offset,
                    size: v.size,
                }
            });
        // zoom each layer
        // emmmm, not now...
        return ctl;
    }
}