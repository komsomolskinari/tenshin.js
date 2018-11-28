// KAG Script parser
import { AutoType } from './util';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
/**
 * @class KSParser
 */
export default class KSParser {
    /**
     * KS script to KS 'AST'
     * @public
     * @param {String} str KS script string to parse
     * @return {Object} KS AST
     * @see _text
     * @see _func
     */
    static parse(str) {
        return new KSParser()._parse(str);
    }

    /**
     * KS script to KS 'AST'
     * @public
     * @param {Object} obj KS AST
     * @return {String} script string
     */
    static stringify(obj) {
        return obj.reduce((str, line) => {
            let l;
            switch (line.type) {
                case "entry":
                    l = '*' + line.name;
                    break;
                case "text":
                    let _name = '';
                    if (line.name != null) {
                        _name = line.name;
                        if (line.display != null) _name += ('/' + line.display);
                        _name = `【${_name}】`;
                    }
                    l = _name + line.text;
                    break;
                case "func":
                    let optstr = line.option.join(' ');
                    let paramstr = Object.keys(line.param)
                        .map(p => `${p}=${line.param[p]}`)
                        .join(' ');

                    let ls = [line.name];
                    if (optstr) ls.push(optstr);
                    if (paramstr) ls.push(paramstr);
                    l = `[${ls.join(' ')}]`
                    break;
                default:
                    l = '';
                    break;
            }
            return str + l + '\n';
        }, "");
    }

    _parse(str) {
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
                    lines = lines.concat(this._cutfunction(l));
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

    _cutfunction(str) {
        let depth = 0;
        let cur = '';
        let ret = [];
        let rawstr = true;
        let rs = '';
        for (let index = 0; index < str.length; index++) {
            const s = str[index];
            cur += s;
            switch (s) {
                case '[':
                    if (rs.length > 0) ret.push(rs);
                    rawstr = false;
                    depth++;
                    break;
                case ']':
                    rawstr = true;
                    rs = '';
                    depth--;
                    if (depth == 0) {
                        ret.push(cur);
                        cur = '';
                    }
                    break;
                default:
                    if (rawstr) rs += s;
                    break;
            }
        }
        if (rs.length > 0) ret.push(rs);
        return ret;
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
        let t = [];
        // jup over 1st space
        while (this._fp < this._fstr.length) {
            this._nextch();
            if (t.length > 10000) throw "too long";
            t.push(this._kv());
        }

        let fparam = t.filter(p => p.haveValue);
        let fopt = t.filter(p => !p.haveValue);

        fparam.forEach(p => ret.param[p.key] = p.value);
        ret.option = fopt.map(p => p.key);
        return ret;
    }

    /**
     * Get key-value pair
     * @see _str
     * @see _ident
     */
    _kv() {
        let ret = {
            key: undefined,
            value: undefined,
            haveValue: false
        };
        ret.key = this._ident();
        if (this._nextch() == '=') {
            ret.haveValue = true;
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
            ret.value = AutoType(r);
        }
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
            // get next char
            let nc = this._fstr[this._fp];
            this._fp++;
            // not token char
            // macro.ks: [eval exp='sf["replay_"+mp.file]=true']
            if (!" \t[]=".includes(nc) && nc != null) {
                b += nc;
            }
            // is token char
            else {
                this._fp--;
                break;
            }
        }
        return b;
    }
}
window.KSParser = KSParser;