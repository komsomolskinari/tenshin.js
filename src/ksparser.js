// KAG Script parser
/*
FAKE!!

grammar ks;

ks: (commands)*;
commands: command | LINE;
command: '[' identifier (arg)? ']';
arg: SP identifier (SP? '=' SP? value)?;
identifier: IDENTCH*;
value: STRING | identifier;

SP: '\p{Z}';
LINE: '[~\r\n]'+;
IDENTCH: '\p{L}';
STRING: '"' .? '"' | '\'' .? '\'';

*/


export class KSParser {
    static Parse(str) {
        this.cmd = [];
        // scan0 to recognize line type and seperate
        // scan1 to fill the data
        // scan2 generate static data
        var _lines = str.split('\n');
        var lines = [];
        _lines.forEach(l => {
            l = l.trim();
            switch (l[0]) {
                case ';':
                    // pass
                    return;
                case '[':
                    // cut to multiple function token
                    l = l.replace(/\](.)/g, ']\n$1');
                    var ls = l.split('\n');
                    ls.forEach(s => lines.push(s));
                    return;
                case '*':
                    // tag, direct
                    lines.push(l);
                    return;
                default:
                    // text, direct
                    lines.push(l);
                    return;
            }
        });
        
        // scan1: text -> token
        this.cmd = lines.map(c => {
            c = c.trim();
            switch (c[0]) {
                case ';': // ignore comment line
                    return null;
                case '[': // type:func
                    return this._func(c);
                case '*': // type:entry *tag|comment
                    var tag = c.substr(1).trim().split('|')[0];
                    if (tag) return { type: "entry", name: tag };
                    else return null;
                default: // type:text
                    if (c) return this._text(c);
                    else return null;
            }
        }).filter(c => c !== null);


        /*
        // scan2: generate voice no.
        // key: charaname, value: curvoiceid
        // watchout 1.ks line 1841
        var mid = {}
        this.cmd = this.cmd.map(c => {
            if (c.type != "text") return c;
            if (c.name == null) return c;
            if (mid[c.name] === undefined) {
                mid[c.name] = 0;
            }
            mid[c.name]++;
            c.voice = mid[c.name];
            return c;
        });*/

        return this.cmd;
    }

    // 【chara/disp】txt
    // {type:text,name:charaname,disp:dispname,text:txt}
    static _text(str) {
        var ret = {
            type: "text",
            name: null,
            display: null,
            text: null
        }

        // have name
        if (str.indexOf('【') == 0) {
            var fname = str.split('】')[0].replace('【', '').trim();
            ret.text = str.split('】')[1].trim();

            // need rewrite name
            if (fname.indexOf('/') >= 0) {
                ret.name = fname.split('/')[0];
                ret.display = fname.split('/')[1];
            }
            else {
                ret.name = fname;
            }
        }
        else {
            ret.text = str;
        }
        return ret;
    }

    // function line parser
    // _fstr;
    // _fp;

    static _nextch(inc) {
        while (this._fstr[this._fp] == ' ') this._fp++;
        var ret = this._fstr[this._fp];
        if (this._fp >= this._fstr.length) ret = null;
        if (inc == true) this._fp++;
        return ret;
    }

    //  [funcname param1 param2=value]
    //  {
    //      "type": "func",
    //      "name": funcname,
    //      "option": ["param1"],
    //      "param": { // or {}
    //          "param2": value
    //      }
    //  }
    static _func(str) {
        this._fstr = str.substr(1, str.length - 2).trim();
        this._fp = 0;
        var ret = {
            type: "func",
            name: this._ident(),
            option: [],
            param: {}
        };
        var k = [];
        var v = [];
        this._nextch();
        while (this._fp < this._fstr.length) {
            if (k.length > 10000) throw "too long";
            var r = this._kv();
            k.push(r[0]);
            v.push(r[1]);
        }

        for (let index = 0; index < k.length; index++) {
            var key = k[index];
            var value = v[index];

            // key = value
            if (key && value) {
                key = key.trim();
                value = value.trim();
                ret.param[key] = value;
            }
            // key
            else if (key) {
                key = key.trim();
                ret.option.push(key);
            }
        }
        return ret;
    }

    // parse key=value
    static _kv() {
        var ret = [];
        ret.push(this._ident());
        if (this._nextch() == '=') {
            this._fp++;
            var r;
            switch (this._nextch()) {
                case '"':
                    this._fp++;
                    r = this._str('"');
                    break;
                case '\'':
                    this._fp++;
                    r = this._str('\'');
                    break;
                default:
                    r = this._ident();
                    break;
            }
            ret.push(r);
        }
        else ret.push(null);
        return ret;
    }

    // parse string
    static _str(sep) {
        var b = '';
        while (true) {
            var nc = this._nextch(true);
            if (!sep.includes(nc) && nc != null) {
                b += nc;
            }
            else {
                return b;
            }
        }
    }

    // parse identifier
    static _ident() {
        var b = '';
        while (true) {
            var nc = this._fstr[this._fp];
            this._fp++;
            if (!" []=".includes(nc) && nc != null) {
                b += nc;
            }
            else {
                this._fp--;
                return b;
            }
        }
    }
}
