import ObjectMapper from "../objmapper";
import FilePath from "../utils/filepath";
import KRCSV from "../utils/krcsv";

export default class YZFgImg {
    static Init() {
        this.KAGLiterial = {
            Both: "KAGEnvImage.BOTH",
            BU: "KAGEnvImage.BU",
            Clear: "KAGEnvImage.CLEAR",
            Face: "KAGEnvImage.FACE",
            Invisible: "KAGEnvImage.INVISIBLE",
            DispPosition: "KAGEnvironment.DISPPOSITION",
            XPosition: "KAGEnvironment.XPOSITION",
            Level: "KAGEnvironment.LEVEL"
        }
    }

    static LoadData(basedir) {
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
        this.files.filter(f => f.match(/info\.txt$/)).forEach(f => this.LoadChunkDef(f));
        this.files.filter(f => f.match(/[0-9]\.txt$/)).forEach(f => this.LoadCoordData(f));
    }


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
                level = cmd.objdata.positions.filter(p => p.type == this.KAGLiterial.Level);
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

    static CalcImageCoord(mcmd) {
        if (!(mcmd.image && mcmd.image.layer)) return;
        let layer = mcmd.image.layer;
        let level = 1;
        if (mcmd.objdata.positions) {
            let lvcmd = mcmd.objdata.positions.filter(p => p.type == this.KAGLiterial.Level);
            if (lvcmd.length) level = parseInt(lvcmd[0].level);
        }

        /*{
            "zoom": "200", // wtf? yoffset?
            "imgzoom": "140", // they use this
            "stretch": "stFastLinear" // needn't, browser will do it
        },*/
        let scaleo = ObjectMapper.innerobj.levels[level];
        let zoom = scaleo.imgzoom / 100;
        // scale < 2, * 1.33 : all magic number
        if (level < 2) zoom = scaleo.zoom * 1.33 / 100;
        let ret = {};
        ret['null'] = {
            size: mcmd.image.size,
            offset: [0, 0]
        }
        layer.forEach(l => {
            ret[l.layer] = {
                offset: l.offset,
                size: l.size
            }
        })
        let rr = {}
        for (const ln in ret) {
            if (ret.hasOwnProperty(ln)) {
                const e = ret[ln];
                rr[ln] = {
                    offset: [e.offset[0] * zoom, e.offset[1] * zoom],
                    size: [e.size[0] * zoom, e.size[1] * zoom]
                }
            }
        }

        let rnsz = rr['null'].size;
        rr['null'].offset = [(1280 - rnsz[0]) / 2, (960 - rnsz[1]) / 2];

        let xoff = null;
        if (mcmd.objdata.positions) {
            let xoffcmd = mcmd.objdata.positions.filter(p => p.type == this.KAGLiterial.XPosition);
            if (xoffcmd.length) xoff = parseInt(xoffcmd[0].xpos);
        }
        console.log(ret, level, zoom, xoff);
        if (xoff !== null)
            rr['null'].offset[0] += xoff;

        // another magic, modify ypos
        if (level > 1) rr['null'].offset[1] -= (240 + 2 * parseInt(scaleo.zoom));
        return rr;
    }

    static DrawChara(mcmd) {
        let ic = this.CalcImageCoord(mcmd);
        let name = mcmd.name;
        let fd = $('#fg_' + name);
        if (ic) {
            // remove unused img
            let fgs = $('#fg_' + name + ' img');
            for (var f of fgs) {
                let i = f.id.split('_').slice(1).join('_')
                if (!Object.keys(ic).includes(i)) {
                    $('#' + f.id).remove()
                }
            }
            if (!fd.length) {
                $('#imagediv').append(
                    $('<div>')
                        .attr('id', 'fg_' + name)
                )
            }

            for (const lname in ic) {
                if (ic.hasOwnProperty(lname)) {
                    const ldata = ic[lname];
                    if (lname == 'null') {
                        // set base div
                        fd
                            .css('position', 'absolute')
                            .css('display', 'block')
                            .css('left', ldata.offset[0])
                            .css('top', ldata.offset[1])
                            .css('width', ldata.size[0])
                            .css('height', ldata.size[1])
                    }
                    else {
                        if (!$('#fgl_' + lname).length) {
                            // add image
                            fd.append(
                                $('<img>')
                                    .attr('id', 'fgl_' + lname)
                                    .attr('src', FilePath.find(lname + '.png'))
                            )
                        }
                        // set image
                        $('#fgl_' + lname)
                            .css('position', 'absolute')
                            .css('display', 'block')
                            .css('left', ldata.offset[0])
                            .css('top', ldata.offset[1])
                            .css('width', ldata.size[0])
                            .css('height', ldata.size[1])
                    }
                }
            }
        }

        if (mcmd.objdata.positions) {
            mcmd.objdata.positions.filter(p => p.type == this.KAGLiterial.DispPosition).forEach(p => {
                switch (p.disp) {
                    case this.KAGLiterial.Both:
                    case this.KAGLiterial.BU:
                        break;
                    case this.KAGLiterial.Clear:
                    case this.KAGLiterial.Face:
                    case this.KAGLiterial.Invisible:
                        fd.remove();
                        break;
                    default:
                        console.warn('Unknown KAGEnviroment.DISPPOSITION', p.disp);
                        break;
                }
            })
        }
    }
}
YZFgImg.Init();