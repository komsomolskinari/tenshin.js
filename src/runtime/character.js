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
    constructor(name) {
        this.name = name;
        this.currentVoice = 1;
        this.nextVoice = undefined;
        this.voiceFmt = ObjectMapper.GetProperty(name).voiceFile;
        this.displayName = ObjectMapper.GetProperty(name).standName;
        // if character has no image, skip image meta
        let fgLs = FilePath.ls(`${Config.Display.CharacterPath}/${name}`);
        /*{
        d1:{
            1:[dname1,prefix1]
        }}*/
        this.dress = {};
        /*{
        prefix1:{
            1:[fname1,fname2]
        }}*/
        this.face = {};
        /*{
        prefix1:{
            variable3:{
                layer4:{
                    offset: [loffx, loffy],
                    size: [lsizex, lsizey],
                    layer: layerid
                }
            }
        }}*/
        this.coord = {};

        /*{
        prefix1:{
            variable1: [x,y],
            variable2: [x,y]
        }}*/
        this.center = {};

        this.imageLevel = 1;
        this.imageXPos = 0;
        this.dispPos = KAGConst.Both;
        this.showedInDom = false;
        this.dressOpt = "";
        Character.characters[name] = this;
        if (fgLs != undefined) this.__LoadImageInfo(fgLs);
    }

    async __LoadImageInfo(list) {
        let files = Object.keys(list);
        // load all data, limit rate here, or it will block pipe
        let pms = [];
        files.filter(f => f.match(/info\.txt$/)).forEach(f => pms.push(this.__LoadChunk(f)));
        files.filter(f => f.match(/[0-9]\.txt$/)).forEach(f => pms.push(this.__LoadCoord(f)));
    }

    async __LoadChunk(filename) {
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

    async __LoadCoord(filename) {
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
    Process(cmd) {
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
            if (!isNaN(parseInt(param.voice))) {
                this.currentVoice = parseInt(param.voice);
            }
            else {
                this.nextVoice = param.voice;
            }
        }

        let mapped = {};
        option.filter(o => ObjectMapper.IsProperty(o)).forEach(o => {
            let t = ObjectMapper.TypeOf(o);
            if (mapped[t] === undefined) mapped[t] = [];
            let mo = ObjectMapper.GetProperty(o);
            if (mo.length === undefined) {
                mapped[t].push(mo);
            }
            else {
                for (const i of mo) {
                    mapped[t].push(i);
                }
            }
        });

        (mapped.positions || []).forEach(p => {
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

        let runner = this
        if (this.displayName && this.displayName !== this.name) {
            let dispch = Character.characters[this.displayName];
            if (dispch) runner = dispch;
        }
        return runner.ProcessImageCmd(option);
    }

    async ProcessImageCmd(option) {
        let allDress = Object.keys(this.dress);
        let dOpt = option.filter(o => allDress.includes(o))[0];
        if (dOpt) {
            this.dressOpt = dOpt;
        }
        let fOpt = option.filter(o => o.match(/^[0-9]{3}$/) != null)[0];
        let imgctl = [];
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

    Text(text, display) {
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
    Voice(seq) {
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
            if (!isNaN(parseInt(s))) {
                stxt = this.voiceFmt;
                // TODO: real printf
                stxt = stxt
                    .replace('%s', Character.voiceBase)
                    .replace('%03d', String(s).padStart(3, '0'));
            }
        }
        // drop extension
        stxt = stxt.replace(/\.[a-z0-9]{2,5}$/i, '');
        YZSound.Voice(stxt);
    }

    Image(faceOpt) {
        // select image
        let mainId = faceOpt.substr(0, 1);
        let varId = faceOpt.substr(1, 2);

        if (!this.dressOpt) this.dressOpt = Object.keys(this.dress)[0];

        let [mainImg, pfx] = this.dress[this.dressOpt][mainId];
        let varImg = this.face[pfx][varId];
        if (varImg === undefined) return;
        // 35 50 75 100 120 140 bgexpand original
        const usedVer = ([1, 1, 3, 3, 3, 5, 3])[this.imageLevel];

        let vImgs = varImg
            .map(v => this.coord[pfx][usedVer][v])
            .map(v => {
                return {
                    layer: v.layer,
                    offset: v.offset,
                    size: v.size
                }
            });
        let mImg = this.coord[pfx][usedVer][mainImg];
        let ctl = [{
            layer: mImg.layer,
            offset: mImg.offset,
            size: mImg.size,
        }];
        ctl = ctl
            .concat(vImgs)
            .map(v => {
                return {
                    name: ([pfx, usedVer, v.layer].join('_')),
                    offset: v.offset,
                    size: v.size,
                }
            });
        // zoom each layer
        // emmmm, not now...
        return ctl;
    }
}
Character.voiceBase = "";
Character.characters = {}
window.Character = Character