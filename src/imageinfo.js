import { FilePath } from "./filepath";
import { KRCSV } from './krcsv';
// image info loader

export class ImageInfo {
    constructor(basedir) {
        const ls = FilePath.ls(basedir);
        this.files = [];
        this.chunkdata = {};
        this.coorddata = {};

        this.chardress = {};
        Object.keys(ls).forEach(key => {
            let subdir = ls[key];
            Object.keys(subdir).forEach(name => {
                if (name.match(/\.txt$/g)) {
                    this.files.push(name);
                }
            })
        });
        // load info file
        this.files.filter(f => f.match(/info\.txt$/g)).forEach(f => this.LoadChunkDef(f));
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
    async LoadChunkDef(file) {
        // 朋花_私服夏_ポーズa_info.txt
        // char_packprefix_info.txt (chunk info)
        // 朋花_私服夏_ポーズa_3.txt
        // char_packprefix_variant.txt (coord data)
        // 朋花_私服夏_ポーズa_3_373.png
        // char_packprefix_variant_id.png (real image)

        let fdata = KRCSV.Parse(await $.get(FilePath.find(file)), '\t', false)
        const fsp = file.split('_')
        const charname = fsp[0];
        const pfx = fsp.slice(1, fsp.length - 1).join('_');
        console.log(pfx);


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
            a_1:{
                name1:{
                    coord:[x,y]
                    size:[x,y]
                    layerno:1234
                }
            }
        }
    }
    */
    async LoadCoordData(file) {
        let fdata = KRCSV.Parse(await $.get(FilePath.find(file)), '\t', false)
        const fvar = parseInt(file.match(/_([0-9])\./)[0]);
        const charname = file.split('_')[0];
        if (this.coorddata[charname] === undefined)
            this.coorddata[charname] = {};
        if (this.coorddata[charname][fvar] === undefined)
            this.coorddata[charname][fvar] = {};
        fdata.forEach(l => {
            const lname = l[1];
            const loffset = [l[2], l[3]];
            const lsize = [l[4], l[5]];
            const lid = l[10];
            this.coorddata[charname][fvar][lname] = {
                offset: loffset,
                size: lsize,
                layer: lid
            };
        })
    }

    // get image info from cmd (unessary info filtered)
    // dress will be cached
    GetImageInfo(cmd) {
        // HACK: rewrite 'unusual' name as a workaround
        // will fix after v1.0
        if (cmd.name == "老竹") cmd.name = "幹雄";

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
        //console.assert(iOption.length < 2, "Multiple iOptions", iOption);

        let base;
        let variant = iOption[0]; // always have variant info
        if (niOption.length > 0) {
            if (iOption.length == 0) {
                console.warn("GetImageInfo, niOpt with no iOpt, direct return", cmd);
                return;
            }
            base = niOption[0]; // optional base
            this.chardress[cmd.name] = this.chunkdata[cmd.name].dress[base];
        }
        if (this.chardress[cmd.name] === undefined) {
            // guess one 
            base = Object.keys(this.chunkdata[cmd.name].dress)[0];
            this.chardress[cmd.name] = this.chunkdata[cmd.name].dress[base];
        }
        var mainImgId = parseInt(variant.substr(0, 1));
        var varImgId = parseInt(variant.substr(1, 2));

        if (this.chardress[cmd.name][mainImgId] === undefined) {
            console.warn("GetImageInfo, chardress lost status, direct return", this.chardress[cmd.name], cmd);
            return;
        }
        let mainImg = this.chardress[cmd.name][mainImgId][0];
        let pfx = this.chardress[cmd.name][mainImgId][1];
        let varImgs = this.chunkdata[cmd.name].face[pfx][varImgId];

        console.log(mainImg, pfx, varImgs);
    }
}