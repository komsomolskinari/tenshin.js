/// <reference path="./parser.d.ts" />

// KAG Script parser
import { AutoType } from "./util";

/**
 * @class KSParser
 */
export default class KSParser {
    /**
     * KS script to KS 'AST'
     * @public
     * @param str KS script string to parse
     * @return KS AST
     * @see _text
     * @see _func
     */
    static parse(str: string) {
        return new KSParser()._parse(str);
    }

    /**
     * KS script to KS 'AST'
     * @public
     * @param obj KS AST
     * @return script string
     */
    static stringify(obj: [KSLine]) {
        return obj.reduce((str, line) => {
            let l;
            switch (line.type) {
                case "entry":
                    l = "*" + line.name;
                    break;
                case "text":
                    let _name = "";
                    if (line.name !== undefined) {
                        _name = line.name;
                        if (line.display !== undefined) _name += ("/" + line.display);
                        _name = `【${_name}】`;
                    }
                    l = _name + line.text;
                    break;
                case "func":
                    const optstr = line.option.join(" ");
                    const paramstr = Object.keys(line.param)
                        .map(p => `${p}=${line.param[p]}`)
                        .join(" ");

                    const ls = [line.name];
                    if (optstr) ls.push(optstr);
                    if (paramstr) ls.push(paramstr);
                    l = `[${ls.join(" ")}]`;
                    break;
                default:
                    l = "";
                    break;
            }
            return str + l + "\n";
        }, "");
    }

    cmd: KSLine[];

    private _parse(str: string) {
        const lines: string[] = [];
        // scan1, check line type
        str.split("\n").forEach(l => {
            l = l.trim();
            switch (l[0]) {
                case ";":
                    // ignore coments
                    return;
                case "[":
                    // cut to multiple function token
                    lines.push(...this._cutfunction(l));
                    return;
                case "*":
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
                case ";": // ignore comment line
                    return undefined;
                case "[": // type:func
                    return this._func(c);
                case "*": // type:entry *tag|comment
                    const tag = c.substr(1).trim().split("|")[0];
                    if (tag) return { type: "entry", name: tag };
                    else return undefined;
                default: // type:text
                    if (c) return this._text(c);
                    else return undefined;
            }
        }).filter(c => c !== undefined);
        return this.cmd;
    }

    private _cutfunction(str: string): string[] {
        let depth = 0;
        let cur = "";
        const ret: string[] = [];
        let rawstr = true;
        let rs = "";
        for (const s of str) {
            cur += s;
            switch (s) {
                case "[":
                    if (rs.length > 0) ret.push(rs);
                    rawstr = false;
                    depth++;
                    break;
                case "]":
                    rawstr = true;
                    rs = "";
                    depth--;
                    if (depth === 0) {
                        ret.push(cur);
                        cur = "";
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
     * @param str
     */
    private _text(str: string) {
        const ret: KSLine = {
            type: "text",
            name: undefined,
            display: undefined,
            text: undefined
        };

        // have name
        if (str.indexOf("【") === 0) {
            const fname = str.split("】")[0].replace("【", "").trim();
            ret.text = str.split("】")[1].trim();

            // need rewrite name
            if (fname.indexOf("/") >= 0) {
                ret.name = fname.split("/")[0];
                ret.display = fname.split("/")[1];
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

    private _fp: number;
    private _fstr: string;
    /**
     * Get next char
     * @param inc Step to next
     */
    private _nextch(inc?: boolean) {
        while (" \f\n\r\t\v".includes(this._fstr[this._fp])) this._fp++;
        let ret = this._fstr[this._fp];
        if (this._fp >= this._fstr.length) ret = undefined;
        if (inc === true) this._fp++;
        return ret;
    }

    /**
     * Parse function line
     * @param str
     * @see _kv
     * @see _ident
     */
    private _func(str: string) {
        this._fstr = str.substr(1, str.length - 2).trim();
        this._fp = 0;
        const ret: KSLine = {
            type: "func",
            name: this._ident(),
            option: [],
            param: {}
        };
        const t = [];
        // jup over 1st space
        while (this._fp < this._fstr.length) {
            this._nextch();
            if (t.length > 10000) throw new Error("too long");
            t.push(this._kv());
        }

        const fparam = t.filter(p => p.haveValue);
        const fopt = t.filter(p => !p.haveValue);

        fparam.forEach(p => ret.param[p.key] = p.value);
        ret.option = fopt.map(p => p.key);
        return ret;
    }

    /**
     * Get key-value pair
     * @see _str
     * @see _ident
     */
    private _kv() {
        const ret: {
            key: string,
            value: JSONObject,
            haveValue: boolean
        } = {
            key: undefined,
            value: undefined,
            haveValue: false
        };
        ret.key = this._ident();
        if (this._nextch() === "=") {
            ret.haveValue = true;
            this._fp++;
            let r;
            switch (this._nextch()) {
                case '"':
                    this._fp++;
                    r = this._str('"');
                    break;
                case "'":
                    this._fp++;
                    r = this._str("'");
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
     * @param sep Separators
     */
    private _str(sep: string) {
        let b = "";
        while (true) {
            const nc = this._nextch(true);
            if (!sep.includes(nc) && nc !== undefined) {
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
    private _ident() {
        let b = "";
        while (true) {
            const nc = this._fstr[this._fp];
            // macro.ks: [eval exp='sf["replay_"+mp.file]=true']
            if (" \t[]=".includes(nc) || nc === undefined) break;
            this._fp++;
            b += nc;
        }
        return b;
    }
}
