// runtime libs
import { ObjectMapper } from './objmapper';

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

        // key voicebase,name
        this.voicecounter = {};
        this.inTrans = false;
        this.transSeq = [];
    }

    Text(cmd) {
        var text = cmd.text;
        var name = cmd.name;
        var dispname = cmd.display;
        var voicebase = this.TJSvar['f.voiceBase'];
        var info = this.mapper.GetNameInfo(name);

        // display name havent rewrite, need set
        if (dispname == null) {
            if (info.name != null) dispname = info.name;
            else dispname = cmd.name;
        }
        var voicefile = info.voicefile;

        //{type:text,name:charaname,display:dispname,text:txt}
        var _vf = this.PlayVoice(voicefile, voicebase, 1)
        console.log(dispname, text, _vf);
        $('#charname').html(dispname);
        $('#chartxt').html(text);
    }

    // kam%s_%03d.ogg, 001, 1 -> kam001_001.ogg
    // not a full printf, magic included
    PlayVoice(file, base, seq) {
        if (file == null) return null;
        var seqtxt = seq + "";
        while (seqtxt.length < 3) {
            seqtxt = '0' + seqtxt;
        }
        file = file.replace('%s', base);
        file = file.replace('%03d', seqtxt);

        return file;
    }

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
            this.TJSeval(ro[2]);
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
                console.log("finished");
                break;
            case "eval":
                this.TJSeval(cmd.param.exp);
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
            case "EV":
            case "bgm":
            case "msgoff":
            case "msgon":
            case "se":
            case "env":
            case "date":
            case "wait":
            case "stage":

                // stateless call
                break;
            default:
                if (this.inTrans) {
                    this.AddTrans(cmd);
                }
                if (!this.mapper.HaveObject(cmd.name))
                    console.log(cmd);
                break;
        }
    }

    // fake eval
    // FAKE! MAGIC INCLUDED!
    // only a = b + c
    // a = "b"
    // and a == b
    // will be eval
    TJSeval(str) {
        if (Object.keys(this.TJShack).includes(str)) return this.TJShack[str];

        // hack for opr1,opr2
        let commaindex = str.indexOf(',');
        if (commaindex >= 0) {
            var ret;
            let s = str.split(',');
            for (const ss of s) {
                ret = this.TJSeval(ss);
            }
            return ret;
        }

        str = str.trim();
        //hack for ++ --
        switch (str.substr(str.length - 2)) {
            case '++':
                this.TJSvar[str.substr(0, str.length - 2).trim()]++;
                return 1;
                break;
            case '--':
                this.TJSvar[str.substr(0, str.length - 2).trim()]++;
                return 1;
                break;
        }

        var returnBool = (str.indexOf("==") >= 0);
        var sp = "=";
        if (returnBool) sp = "==";
        var lr = str.split(sp);
        var lvalue = lr[0];
        var rexp = lr[1];

        var rvalue = null;
        // cacluate rvalue
        rexp = rexp.trim().replace(/([+\-\*\/])/g, " $1 ").split(/ +/g);
        if (rexp.length == 1) {
            // a == b or a = b
            if (rexp[0][0] == '"') rvalue = rexp[0].substr(1, rexp[0].length - 2);
            else if ("0123456789".includes(rexp[0][0])) rvalue = parseInt(rexp[0]);
            else rvalue = this.TJSvar[rexp[0]];
        }
        else {
            var rv1;
            var rv2;
            // a ==/= b opr c
            // use standard stack mode to handle rvalue
            for (const r of rexp) {
                if (rexp[0][0] == '"') rv1 = rexp[0].substr(1, rexp[0].length - 2);
                else if ("0123456789".includes(rexp[0][0])) rv1 = parseInt(rexp[0]);
                else rv1 = this.TJSvar[rexp[0]];
                if (rexp[2][0] == '"') rv2 = rexp[2].substr(1, rexp[2].length - 2);
                else if ("0123456789".includes(rexp[2][0])) rv2 = parseInt(rexp[2]);
                else rv2 = this.TJSvar[rexp[2]];
            }
            // +-*/ switch
            switch (rexp[1][0]) {
                case '+':
                    rvalue = rv1 + rv2;
                    break;
                case '-':
                    rvalue = rv1 - rv2;
                    break;
                case '*':
                    rvalue = rv1 * rv2;
                    break;
                case '/':
                    rvalue = rv1 / rv2;
                    break;
                default:
                    rvalue = 0;
                    break;
            }
        }

        if (returnBool) {
            var lv;
            if (lvalue[0] == '"') lv = lvalue.substr(1, lvalue.length - 2);
            else if ("0123456789".includes(lvalue[0])) lv = parseInt(lvalue);
            else lv = this.TJSvar[lvalue];
            if ((lv - rvalue) * (lv - rvalue) < 0.0001) return true;
            else return false;
        }
        else {
            this.TJSvar[lvalue] = rvalue;
            return rvalue;
        }
    }
}