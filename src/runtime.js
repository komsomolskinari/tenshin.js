// runtime libs
import ObjectMapper from './objmapper';
import KSParser from './utils/ksparser';
import TJSeval from './utils/tjseval';

import YZSound from './ui/sound';
import YZFgImg from './ui/fgimg';

export default class Runtime {
    static Init() {
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
        window.TJSvar = this.TJSvar;

        this.inTrans = false;
        this.transSeq = [];
    }

    // Text related commands
    // 
    static Text(cmd) {
        var text = cmd.text;
        var name = cmd.name;
        var dispname = cmd.display;
        var info = ObjectMapper.GetNameInfo(name);

        // display name haven't been rewrite, need set
        if (dispname == null) {
            if (info.name != null) dispname = info.name;
            else dispname = cmd.name;
        }
        YZSound.Voice(cmd.name, this.TJSvar['f.voiceBase'], cmd.param ? cmd.param.voice : undefined)
        $('#charname').html(dispname);
        $('#chartxt').html(this.TextHTML(text));
    }

    // convert text with ks format cmd to html
    static TextHTML(txt) {
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
    static MapSelectAdd(cmd) {
        this.MapSelectData.push([
            cmd.param.name,
            cmd.param.target,
            cmd.param.cond,
            cmd.param.storage,
            cmd.param.place,
        ]);
    }

    // raise a map select
    static MapSelect() {
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

    static SelectAdd(cmd) {
        this.SelectData.push([
            cmd.param.text,
            cmd.param.target,
            cmd.param.exp,
            cmd.param.storage,
        ]);
    }

    // raise a normal select
    static Select() {
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

    static AddTrans(cmd) {

    }

    static CompileTrans(cmd) {
        this.inTrans = false;
    }

    static Call(cmd) {
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
                ObjectMapper.NewLay(cmd);
                break;
            case "dellay":
                ObjectMapper.DelLay(cmd);
                break;
            case "bgm":
                YZSound.BGM(cmd);
                break;
            default:
                // Jump unimpliement cmd
                if (["ev", "msgoff", "msgon", "se", "env", "date", "wait", "stage",
                    "beginskip", "endskip", "fadepausebgm", "fadebgm", "pausebgm", "resumebgm", "opmovie", "edmovie",
                    "initscene", "day_full", "ano_view", "ret_view", "playbgm", "delaydone", "white_ball", "white_ball_hide", "particle"].includes(cmd.name.toLowerCase())) break;
                // TODO: Use ObjectMapper to compile command
                // And send an UI frontend
                if (ObjectMapper.HaveObject(cmd.name)) {
                    let mapped = ObjectMapper.MapObject(cmd);
                    //this.DrawObject(mapped);
                    YZFgImg.DrawChara(mapped);
                }

                if (this.inTrans) {
                    this.AddTrans(cmd);
                }
                if (!ObjectMapper.HaveObject(cmd.name))
                    console.warn("RuntimeCall, unimpliement cmd", cmd);
                break;
        }
    }
}
Runtime.Init();