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

/**
 * @class KSParser
 */
export class KSParser {
    /**
     * KS script to KS 'AST'
     * @public @static
     * @param {String} str KS script string to parse
     * @return {Object} KS AST
     * @see _text
     * @see _func
     */
    static Parse(str) {
        var lines = [];
        // scan1, check line type
        str.split('\n').forEach(l => {
            l = l.trim();
            switch (l[0]) {
                case ';':
                    // ignore coments
                    return;
                case '[':
                    // cut to multiple function token
                    l = l.replace(/\](.)/g, ']\n$1');
                    var ls = l.split('\n');
                    ls.forEach(s => lines.push(s));
                    return;
                case '*':
                    // tag, direct pass
                    lines.push(l);
                    return;
                default:
                    // text, direct pass
                    lines.push(l);
                    return;
            }
        });

        // scan2, generate objects
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
        return this.cmd;
    }

    /**
     * Parse text line
     * @private @static
     * @param {String} str
     * @returns {{type:string,name:string,display:string,text:string}}
     */
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

    /**
     * Get next char
     * @static @private
     * @param {Boolean} inc Step to next
     */
    static _nextch(inc) {
        while (" \f\n\r\t\v".includes(this._fstr[this._fp])) this._fp++;
        var ret = this._fstr[this._fp];
        if (this._fp >= this._fstr.length) ret = null;
        if (inc == true) this._fp++;
        return ret;
    }

    /**
     * Parse function line
     * @private @static
     * @param {String} str
     * @returns {{type:String,name:String,option:[String],param:{}}}
     * @see _kv
     * @see _ident
     */
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

    /**
     * Get key-value pair
     * @see _str
     * @see _ident
     */
    // TODO: support [func key=]
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

    /**
     * Parse string
     * @private @static
     * @param {String} sep Separators
     */
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

    /**
     * Parse identifier
     * @private @static
     */
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
