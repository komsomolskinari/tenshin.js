
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
        let scaleo = window.Mapper.innerobj.levels[level];
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

        // another magic
        if (level > 1) rr['null'].offset[1] -= (300 + parseInt(scaleo.zoom));
        return rr;
    }


    static DrawChara(mcmd) {
        let ic = this.CalcImageCoord(mcmd);
        console.log(ic);
        if (ic) {
            let name = mcmd.name;
            // remove unused img
            let fgs = $('#fg_' + name + ' img');
            for (var f of fgs) {
                let i = f.id.split('_').slice(1).join('_')
                if (!Object.keys(ic).includes(i)) {
                    $('#' + f.id).remove()
                }
            }
            if (!$('#fg_' + name).length) {
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
                        $('#fg_' + name)
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
                            $('#fg_' + name).append(
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
                        $('#fg_' + mobj.name).remove();
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