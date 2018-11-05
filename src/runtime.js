// runtime libs
import { ObjectMapper } from './objmapper';
import { FilePath } from './utils/filepath';
import { KSParser } from './utils/ksparser';
import { TJSeval } from './utils/tjseval';
import { ImageInfo } from './imageinfo';

import { YZSound } from './ui/sound';

export class Runtime {
    constructor() {
        this.vm = null;
        // key: var name
        this.TJSvar = {};
        // set tjs eval native implement hack
        // only use when fail
        // key: input string
        // value: return value
        this.TJShack = {};
        this.MapSelectData = [];
        this.SelectData = [];
        this.mapper = null;
        window.TJSvar = this.TJSvar;

        // key: chara name
        this.voicecounter = {};
        // 'immediately' mode voice, only when voice not int
        // only trigged one time per cmd, not change ctr
        this.immvoice = {};

        this.inTrans = false;
        this.transSeq = [];
    }

    // Text related commands
    // 
    Text(cmd) {
        var text = cmd.text;
        var name = cmd.name;
        var dispname = cmd.display;
        var info = this.mapper.GetNameInfo(name);

        // display name haven't been rewrite, need set
        if (dispname == null) {
            if (info.name != null) dispname = info.name;
            else dispname = cmd.name;
        }
        // calculate voice file name
        var voiceseq;
        if (this.immvoice[cmd.name]) {
            voiceseq = this.immvoice[cmd.name];
            this.immvoice[cmd.name] = null;
        }
        else {
            voiceseq = this.voicecounter[cmd.name];
            this.voicecounter[cmd.name]++;
        }
        //{type:text,name:charaname,display:dispname,text:txt}
        //var _vf = this.PlayVoice(info.voicefile, this.TJSvar['f.voiceBase'], voiceseq);
        YZSound.Voice(cmd.name, this.TJSvar['f.voiceBase'], cmd.param ? cmd.param.voice : undefined)
        //console.debug(dispname, text, _vf);

        $('#charname').html(dispname);
        $('#chartxt').html(this.TextHTML(text));
    }

    // convert text with ks format cmd to html
    TextHTML(txt) {
        if (txt.indexOf('[') < 0) return txt;
        // first, cut to lines: text\n[cmd]\ntext
        const t = txt
            .replace(/\[/g, '\n[')
            .replace(/\]/g, ']\n')
            .split('\n');
        // generate raw text and cmd position
        let rs = "";
        // [[pos,cmd,opt,arg],...] use KSParser to parse function
        let c = [];
        t.forEach(e => {
            if (e[0] == '[') {
                let f = KSParser.Parse(e)[0];
                c.push([rs.length, f.name, f.option, f.param])
            }
            else {
                rs += e;
            }
        })
        let p = 0;
        let ret = "";
        c.forEach(t => {
            // append unformatted txt
            ret += rs.substr(p, t[0] - p);
            p = t[0];
            switch (t[1]) {
                case 'ruby':
                    ret += '<ruby>';
                    ret += rs[p];
                    p++;
                    ret += '<rt>';
                    ret += t[3].text;
                    ret += '</rt></ruby>';
                    break;
                case 'r':
                    ret += '<br />';
                    break;
                default:
                    console.warn("TextHTML, Unimplied inline tag", t);
                    break;
            }
        });
        ret += rs.substr(p);
        return ret;
    }

    // TODO: mselect is Tenshin Ranman only command?
    // add map select option
    MapSelectAdd(cmd) {
        this.MapSelectData.push([
            cmd.param.name,
            cmd.param.target,
            cmd.param.cond,
            cmd.param.storage,
            cmd.param.place,
        ]);
    }

    // raise a map select
    MapSelect() {
        var s = "Map:\n";
        var n = 0;
        for (const d of this.MapSelectData) {
            s += n;
            s += d[0];
            s += '\n';
            n++;
        }
        var r = prompt(s, 0);
        var ro = this.MapSelectData[r];
        this.MapSelectData = [];
        return [ro[1], ro[3]];
    }

    SelectAdd(cmd) {
        this.SelectData.push([
            cmd.param.text,
            cmd.param.target,
            cmd.param.exp,
            cmd.param.storage,
        ]);
    }

    // raise a normal select
    Select() {
        var s = "";
        var n = 0;
        for (const d of this.SelectData) {
            s += n;
            s += d[0];
            s += '\n';
            n++;
        }
        var r = prompt(s, 0);
        var ro = this.SelectData[r];
        if (ro[2] !== undefined)
            TJSeval(ro[2], this);
        this.SelectData = [];
        return [ro[1], ro[3]];
    }

    AddTrans(cmd) {

    }

    CompileTrans(cmd) {
        this.inTrans = false;
    }

    Call(cmd) {
        switch (cmd.name) {
            case "mselinit":
                this.MapSelectData = [];
                break;
            case "mseladd":
                this.MapSelectAdd(cmd);
                break;
            case "seladd":
                this.SelectAdd(cmd);
                break;
            case "sysjump":
                console.debug("Sysjump, EOF?", cmd);
                break;
            case "eval":
                TJSeval(cmd.param.exp, this);
                break;
            case "begintrans":
                this.inTrans = true;
                break;
            case "endtrans":
                this.CompileTrans(cmd);
                break;
            case "newlay":
                this.mapper.NewLay(cmd);
                break;
            case "dellay":
                this.mapper.DelLay(cmd);
                break;
            case "bgm":
                //this.BGM(cmd);
                break;
            default:
                // Jump unimpliement cmd
                if (["ev", "msgoff", "msgon", "se", "env", "date", "wait", "stage",
                    "beginskip", "endskip", "fadepausebgm", "fadebgm", "pausebgm", "resumebgm", "opmovie", "edmovie",
                    "initscene", "day_full", "ano_view", "ret_view", "playbgm", "delaydone", "white_ball", "white_ball_hide", "particle"].includes(cmd.name.toLowerCase())) break;
                // TODO: Use ObjectMapper to compile command
                // And send an UI frontend
                if (this.mapper.HaveObject(cmd.name)) {
                    let mapped = this.mapper.MapObject(cmd);
                    this.DrawObject(mapped);
                }

                if (this.inTrans) {
                    this.AddTrans(cmd);
                }
                if (!this.mapper.HaveObject(cmd.name))
                    console.warn("RuntimeCall, unimpliement cmd", cmd);
                break;
        }
    }

    /*mobj.image
    {
        size:[number,number],
        layer:[
            {
                offset:[number,number],
                size:[number,number],
                layer:string
            }
        ]
    }*/
    CalcImageCoord(mobj) {
        if (!(mobj.image && mobj.image.layer)) return;
        let layer = mobj.image.layer;
        let level = 1;
        if (mobj.objdata.positions) {
            let lvcmd = mobj.objdata.positions.filter(p => p.type == "KAGEnvironment.LEVEL");
            if (lvcmd.length) level = parseInt(lvcmd[0].level);
        }

        /*{
            "zoom": "200", // wtf? yoffset?
            "imgzoom": "140", // they use this
            "stretch": "stFastLinear" // needn't, browser will do it
        },*/
        let scaleo = this.mapper.innerobj.levels[level];
        let zoom = scaleo.imgzoom / 100;
        // scale < 2, * 1.33 : all magic number
        if (level < 2) zoom = scaleo.zoom * 1.33 / 100;
        let ret = {};
        ret['null'] = {
            size: mobj.image.size,
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
        if (mobj.objdata.positions) {
            let xoffcmd = mobj.objdata.positions.filter(p => p.type == "KAGEnvironment.XPOSITION");
            if (xoffcmd.length) xoff = parseInt(xoffcmd[0].xpos);
        }
        console.log(ret, level, zoom, xoff);
        if (xoff !== null)
            rr['null'].offset[0] += xoff;

        // another magic
        if (level > 1) rr['null'].offset[1] -= (300 + parseInt(scaleo.zoom));
        return rr;
    }

    DrawObject(mobj) {
        let ic = this.CalcImageCoord(mobj);
        console.log(ic);
        if (ic) {
            let name = mobj.name;
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

        if (mobj.objdata.positions) {
            mobj.objdata.positions.filter(p => p.type == "KAGEnvironment.DISPPOSITION").forEach(p => {
                switch (p.disp) {
                    case "KAGEnvImage.BOTH":
                    case "KAGEnvImage.BU":
                        break;
                    case "KAGEnvImage.CLEAR":
                    case "KAGEnvImage.FACE":
                    case "KAGEnvImage.INVISIBLE":
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