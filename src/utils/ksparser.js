// KAG Script parser

export default class KSParser {
    static Parse(str) {
        return new _KSParser().Parse(str);
    }
}

/**
 * @class KSParser
 */
class _KSParser {
    /**
     * KS script to KS 'AST'
     * @public
     * @param {String} str KS script string to parse
     * @return {Object} KS AST
     * @see _text
     * @see _func
     */
    Parse(str) {
        let lines = [];
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
                    l.split('\n').forEach(s => lines.push(s));
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
                    let tag = c.substr(1).trim().split('|')[0];
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
    _text(str) {
        let ret = {
            type: "text",
            name: null,
            display: null,
            text: null
        }

        // have name
        if (str.indexOf('【') == 0) {
            let fname = str.split('】')[0].replace('【', '').trim();
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
     * @private
     * @param {Boolean} inc Step to next
     */
    _nextch(inc) {
        while (" \f\n\r\t\v".includes(this._fstr[this._fp])) this._fp++;
        let ret = this._fstr[this._fp];
        if (this._fp >= this._fstr.length) ret = null;
        if (inc == true) this._fp++;
        return ret;
    }

    /**
     * Parse function line
     * @private
     * @param {String} str
     * @returns {{type:String,name:String,option:[String],param:{}}}
     * @see _kv
     * @see _ident
     */
    _func(str) {
        this._fstr = str.substr(1, str.length - 2).trim();
        this._fp = 0;
        let ret = {
            type: "func",
            name: this._ident(),
            option: [],
            param: {}
        };
        let k = [];
        let v = [];
        this._nextch();
        while (this._fp < this._fstr.length) {
            if (k.length > 10000) throw "too long";
            let r = this._kv();
            k.push(r[0]);
            v.push(r[1]);
        }

        for (let index = 0; index < k.length; index++) {
            let key = k[index];
            let value = v[index];

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
    _kv() {
        let ret = [];
        ret.push(this._ident());
        if (this._nextch() == '=') {
            this._fp++;
            let r;
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
    _str(sep) {
        let b = '';
        while (true) {
            let nc = this._nextch(true);
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
     * @private
     */
    _ident() {
        let b = '';
        while (true) {
            let nc = this._fstr[this._fp];
            this._fp++;
            if (!" \t[]=".includes(nc) && nc != null) {
                b += nc;
            }
            else {
                this._fp--;
                return b;
            }
        }
    }
}
window.KSParser = KSParser;