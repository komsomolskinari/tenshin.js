import FilePath from "./utils/filepath";
import KRCSV from './utils/krcsv';
// image info loader

export default class ImageInfo {
    static Init(basedir) {
        const ls = FilePath.ls(basedir);
        this.files = [];
        this.chunkdata = {};
        this.coorddata = {};

        this.chardress = {};
        // image size selection cache
        // image size info caculated by Objmapper
        // and passed in cmd.objdata.size
        Object.keys(ls).forEach(key => {
            let subdir = ls[key];
            Object.keys(subdir).forEach(name => {
                if (name.match(/\.txt$/g)) {
                    this.files.push(name);
                }
            })
        });
        // load info file
        this.files.filter(f => f.match(/info\.txt$/)).forEach(f => this.LoadChunkDef(f));

        this.files.filter(f => f.match(/[0-9]\.txt$/)).forEach(f => this.LoadCoordData(f));
    }
    /* this.chunkdata   char->dg1->1->02
    {
        char:{
            dress:{
                dg1:{
                    1:[dv1,pfx1]
                    2:[dv2,pfx1]
                    3:[dv3,pfx2]
                }
            }
            face:{
                pfx1:{
                    1:[1a,1b]
                    2:[2a]
                }
                pfx2:{
                    1:[1c]
                }
            }
        }
    }*/
    static async LoadChunkDef(file) {
        let fdata = KRCSV.Parse(await $.get(FilePath.find(file)), '\t', false)
        const fsp = file.split('_')
        const charname = fsp[0];
        const pfx = fsp.slice(1, fsp.length - 1).join('_');

        // load chunk data
        if (this.chunkdata[charname] === undefined)
            this.chunkdata[charname] = {
                dress: {},
                face: {}
            };
        fdata.filter(l => l.length == 5).forEach(l => {
            let dname = l[1];
            let dno = l[3];
            let dvstr = l[4];
            if (this.chunkdata[charname].dress[dname] === undefined)
                this.chunkdata[charname].dress[dname] = {};
            this.chunkdata[charname].dress[dname][dno] = [dvstr, pfx];
        })
        fdata.filter(l => l.length == 4).forEach(l => {
            let fno = l[1];
            let fvstr = l[3];
            if (this.chunkdata[charname].face[pfx] == undefined)
                this.chunkdata[charname].face[pfx] = {};
            if (this.chunkdata[charname].face[pfx][fno] == undefined)
                this.chunkdata[charname].face[pfx][fno] = [];
            this.chunkdata[charname].face[pfx][fno].push(fvstr);
        })
    }

    /*
    {
        char:{
            pfx1:{
                a_1:{
                    name1:{
                        coord:[x,y]
                        size:[x,y]
                        layerno:1234
                    }
                }
            }
        }
    }
    */
    static async LoadCoordData(file) {
        let fdata = KRCSV.Parse(await $.get(FilePath.find(file)), '\t')
        const fvar = file.match(/_([0-9])\./)[1];
        const fsp = file.split('_');
        const pfx = fsp.slice(1, fsp.length - 1).join('_');
        const charname = fsp[0];
        if (this.coorddata[charname] === undefined)
            this.coorddata[charname] = {};
        if (this.coorddata[charname][pfx] === undefined)
            this.coorddata[charname][pfx] = {};
        if (this.coorddata[charname][pfx][fvar] === undefined)
            this.coorddata[charname][pfx][fvar] = {};
        fdata.forEach(l => {
            const lname = l[1];
            const loffset = [l[2], l[3]];
            const lsize = [l[4], l[5]];
            const lid = l[9];
            this.coorddata[charname][pfx][fvar][lname] = {
                offset: loffset,
                size: lsize,
                layer: lid
            };
        })
    }

    // get image info from cmd (unessary info filtered)
    // dress will be cached

    /**
     * 
     * @param {*} cmd 
     * @return {{base:[number,number],layer:[{offset:[number,number],size:[number,number],layer:string}]}};
     */
    static GetImageInfo(cmd) {
        // HACK: rewrite 'unusual' name as a workaround
        // will fix after v1.0
        if (cmd.name == "老竹") cmd.name = "幹雄";

        let level = null;
        if (cmd.objdata !== undefined) {
            if (cmd.objdata.positions !== undefined) {
                level = cmd.objdata.positions.filter(p => p.type == "KAGEnvironment.LEVEL");
                if (level.length > 1) {
                    console.warn("GetImageInfo, multiple LEVEL", cmd);
                }
                if (level.length == 0) {
                    level = null;
                }
                else {
                    level = level[0].level;
                }
            }
        }
        if (level == null) {
            level = 1;
        }

        // 35 50 75 100 120 140 bgexpand original
        let levelConvMap = [1, 1, 3, 3, 3, 5, 3]

        // 佐奈 制服春 110
        // 佐奈->制服春->1->10

        if (cmd.option.length == 0) return;
        // non integer option
        let niOption = cmd.option.filter(o => isNaN(parseInt(o)));
        // integerOption
        let iOption = cmd.option.filter(o => !isNaN(parseInt(o)));

        console.assert(niOption.length < 2, "Multiple niOptions", niOption);
        // HACK: 2.ks:897, it's 301 or 101? just drop it now
        if (iOption.length >= 2) {
            console.warn("GetImageInfo, multiple iOptions, direct return", cmd);
            return;
        }

        let base;
        let variant = iOption[0]; // always have variant info
        if (niOption.length > 0) {

            base = niOption[0]; // optional base
            this.chardress[cmd.name] = this.chunkdata[cmd.name].dress[base];
            if (iOption.length == 0) return;
        }

        if (this.chardress[cmd.name] === undefined) {
            // guess one 
            base = Object.keys(this.chunkdata[cmd.name].dress)[0];
            this.chardress[cmd.name] = this.chunkdata[cmd.name].dress[base];
        }
        let mainImgId = parseInt(variant.substr(0, 1));
        let varImgId = parseInt(variant.substr(1, 2));

        if (this.chardress[cmd.name][mainImgId] === undefined) {
            console.warn("GetImageInfo, chardress lost status, direct return", this.chardress[cmd.name], cmd);
            return;
        }
        let mainImg = this.chardress[cmd.name][mainImgId][0];
        let pfx = this.chardress[cmd.name][mainImgId][1];
        let varImgs = this.chunkdata[cmd.name].face[pfx][varImgId];

        if (varImgs === undefined) {
            console.warn("GetImageInfo, varImgs not found, direct return", [varImgId], cmd);
            return;
        }

        let raw = [];
        const usedVer = levelConvMap[level];
        raw.push(this.coorddata[cmd.name][pfx][usedVer][mainImg]);
        varImgs.forEach(v => raw.push(this.coorddata[cmd.name][pfx][usedVer][v]));

        const nameConverted = raw.map(v => {
            return {
                layer: ([cmd.name, pfx, usedVer, v.layer].join('_')),
                offset: v.offset,
                size: v.size
            }
        });
        const baseSize = this.coorddata[cmd.name][pfx][usedVer]['null'].size;
        return {
            size: baseSize,
            layer: nameConverted
        }
    }
}