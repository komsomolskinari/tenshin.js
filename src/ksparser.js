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
        // seperate function to multiple line
        // [func1][func2] => [func1]\n[func2] 
        str = str.replace(/\](.)/g, ']\n$1');
        var lines = str.split('\n');
        parseline:
        for (let index = 0; index < lines.length; index++) {
            var element = lines[index];
            element = element.trim();

            switch (element[0]) {
                case ';': // ignore line
                    continue parseline;
                case '[': // parse function
                    this.cmd.push(this._func(element));
                    break;
                case '*':
                    var tag = element.substr(1).trim().split('|')[0];
                    if (tag)
                        this.cmd.push({ "type": "entry", "name": tag });
                    break;
                default: // direct output to tty
                    if (element)
                        this.cmd.push({ "type": "text", "name": element });
                    break;
            }
        }
        return this.cmd;
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
    //      "name": funcname,
    //      "option": ["param1"],
    //      "param": { // or {}
    //          "param2": value
    //      }
    //  }
    static _func(str) {
        this._fstr = str.substr(1, str.length - 2).trim();
        this._fp = 0;
        var ret = {};
        ret["type"] = "func";
        ret["name"] = this._ident();
        ret["option"] = [];
        ret["param"] = {};

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
