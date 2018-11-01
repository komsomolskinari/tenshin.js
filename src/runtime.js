// runtime libs
import { ObjectMapper } from './objmapper';
import { FilePath } from './filepath';
import { KSParser } from './ksparser';
import { TJSeval } from './tjseval';
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
        var _vf = this.PlayVoice(info.voicefile, this.TJSvar['f.voiceBase'], voiceseq);
        console.debug(dispname, text, _vf);

        $('#charname').html(dispname);
        $('#chartxt').html(this.TextHTML(text));
    }

    // kam%s_%03d.ogg, 001, 1 -> kam001_001.ogg
    // not a full printf, magic included
    PlayVoice(file, base, seq) {
        if (file == null) return null;
        var seqtxt;
        if (parseInt(seq)) {
            seqtxt = seq + "";
            while (seqtxt.length < 3) {
                seqtxt = '0' + seqtxt;
            }
            file = file.replace('%s', base);
            file = file.replace('%03d', seqtxt);
        }
        else {
            file = (seq + '.ogg').replace(/(\.ogg)+/, '.ogg');
        }
        $('#voice').attr('src', FilePath.find(file));
        return file;
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

    // [bgm]
    BGM(cmd) {
        if (cmd.param.storage) {
            let realname = cmd.param.storage.replace(/bgm/g, 'BGM') + '.ogg';
            $('#bgm').attr('src', FilePath.find(realname));
        }
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
                this.BGM(cmd);
                break;
            default:
                // Jump unimpliement cmd
                if (["ev", "msgoff", "msgon", "se", "env", "date", "wait", "stage",
                    "beginskip", "endskip", "fadepausebgm", "fadebgm", "pausebgm", "resumebgm", "opmovie", "edmovie",
                    "initscene", "day_full", "ano_view", "ret_view", "playbgm", "delaydone", "white_ball", "white_ball_hide", "particle"].includes(cmd.name.toLowerCase())) break;
                // TODO: Use ObjectMapper to compile command
                // And send an UI frontend
                if (this.mapper.HaveObject(cmd.name)) {
                    if (cmd.param.voice !== undefined) {
                        if (parseInt(cmd.param.voice))
                            this.voicecounter[cmd.name] = parseInt(cmd.param.voice);
                        else
                            this.immvoice[cmd.name] = cmd.param.voice;
                    }
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

    DrawObject(mobj) {
        if (mobj.image) {
            // <div id='chara'>
            // <img 1><img 2>
            // just a test here
            if ($('#fg_' + mobj.name).length == 0) {
                $('#imagediv').append('<div id="fg_' + mobj.name + '"></div>');
                $('#fg_' + mobj.name)
                    .html('')
                    .css('position', 'absolute')
                    .css('top', '-1000px');
            }
            else {
                $('#fg_' + mobj.name)
                    .html('')
                    .css('position', 'absolute')
                    .css('top', '-1000px');
            }
            mobj.image.forEach(i => {
                $('#fg_' + mobj.name)
                    .append(
                        '<img src="' + FilePath.find(i.layer + '.png') + '" style="position:absolute;left:' + i.offset[0] + 'px;top:' + i.offset[1] + 'px" />'
                    )
            })
        }

        if (mobj.objdata.positions) {
            let xposs = mobj.objdata.positions.filter(p => p.type == "KAGEnvironment.XPOSITION")
            if (xposs && xposs.length > 0) {
                let cxoff = xposs[0].xpos;
                $('#fg_' + mobj.name).css('left', (cxoff - 400) + 'px');
            }
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