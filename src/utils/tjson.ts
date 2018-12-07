/// <reference path="./parser.d.ts" />


// Kirikiri TPV JavaScript Object Notation to JSON
// TJSON: JSON of TJS, TJS is JavaScript(TM) like language, like JavaScript, it has JSON.

/**
 * @class TJSON Parser,
 */
export default class TJSON {
    /**
     * JSON.parse in TJS world
     * @public
     * @param {String} str
     * @return {*}
     */
    static parse(str: string) {
        return new TJSON()._parse(str);
    }
    /**
     * JSON.stringify in TJS world
     * @public
     * @param {*} obj
     * @return {String}
     */
    static stringify(obj: any): string {
        switch (typeof (obj)) {
            case "boolean": // true & false
                if (obj) return "true";
                else return "false";
                break;
            case "number": // 123
                return String(obj);
                break;
            case "object": // WATCHOUT! everything is object in JS
                // get out of switch
                break;
            case "string": // 'too young'
                return '"' + obj + '"';
                break;
            case "symbol":
            case "undefined":
            case "function":
            default: // WTF!
                return undefined;
                break;
        }
        // so all 'object' goes here
        if (Array.isArray(obj)) { // []
            const subs = obj
                .map(o => this.stringify(o))
                .filter(o => o !== undefined);
            return `[${subs.join(",")}]`;
        }
        if (obj === null) { // null
            return "null";
        }
        // this is for {} , or  %[]
        const s: string[] = Object.keys(obj).map(k => {
            const vs = this.stringify(obj[k]);
            if (vs === undefined) return undefined;
            else return `"${k}"=>${vs}`;
        }).filter(i => i !== undefined);
        return `%[${s.join(",")}]`;
    }


    /**
     * Get next non-empty char
     * @private @static
     * @param {Boolean} step Step to next char
     * @returns {String}
     */
    private _nextnechar(step?: boolean) {
        let ret;
        for (; this.ptr < this.str.length; this.ptr++) {
            if (!" \f\n\r\t\v".includes(this.str[this.ptr])) {
                ret = this.str[this.ptr];
                break;
            }
        }
        if (step === true) this.ptr++;
        return ret;
    }

    str = "";
    ptr = 0;
    obj: JSONObject = undefined;
    /**
     * Parse TJSON to object, just like JSON.Parse
     * @public @static
     * @param {String} str TJSON string
     * @returns {PrimitiveObject}
     */
    private _parse(str: string): JSONObject {
        this.str = "";
        this.ptr = 0;
        this.obj = undefined;

        if (str === undefined) return undefined;
        const lines = str.split("\n");

        for (const line of lines) {
            const element = line.replace(/^\r+|\r+$/g, "");
            // remove comment so we neednt parse it
            const idx = element.indexOf("//");
            this.str += idx >= 0 ? element.substring(0, idx) : element;
        }
        this.obj = this._value();
        return this.obj;
    }

    /**
     * Get next 'value', map to _obj() _array() _string()
     * @private @static
     */
    private _value(): JSONObject {
        let r;
        switch (this._nextnechar()) {
            case "%":
                r = this._obj();
                break;
            case "[":
                r = this._array();
                break;
            case undefined:
                throw new Error("fail");
            default:
                r = this._string();
                break;
        }
        return r;
    }

    /**
     * Get next 'Object' (%[key1=>value1,...])
     * @private @static
     */
    private _obj(): PrimitiveObject {
        const r: PrimitiveObject = {};
        if (this._nextnechar(true) !== "%") throw new Error("fail");
        if (this._nextnechar(true) !== "[") throw new Error("fail");
        let lp;
        const br = true;
        read_token:
        while (br) {
            if (this._nextnechar() !== "]") {
                lp = this._pair();
                r[lp.key] = lp.value;
            }
            else {
                this.ptr++;
                break read_token;
            }
            switch (this._nextnechar(true)) {
                case ",":
                    break;
                case "]":
                    break read_token;
                default:
                    throw new Error("fail");
            }
        }
        return r;
    }

    /**
     * Get next 'Array' ([value1,...])
     * @private @static
     */
    private _array(): any[] {
        const r = [];
        if (this._nextnechar(true) !== "[") throw new Error("fail");
        const br = true;
        read_token:
        while (br) {
            if (this._nextnechar() !== "]") {
                r.push(this._value());
            }
            else {
                this.ptr++;
                break read_token;
            }
            switch (this._nextnechar(true)) {
                case ",":
                    break;
                case "]":
                    break read_token;
                default:
                    throw new Error("fail");
            }
        }
        return r;
    }

    /**
     * Get next 'key-value pair' (key1=>value1)
     * @private @static
     */
    private _pair(): KeyValuePair {
        const r: KeyValuePair = { key: "", value: "" };
        r.key = this._string();
        switch (this._nextnechar(true)) {
            case "=":
                if (this._nextnechar(true) !== ">") {
                    throw new Error("fail");
                }
                break;
            case ":":
                break;
            default:
                throw new Error("fail");
        }
        r.value = this._value();
        // forward predict
        if (!",]".includes(this._nextnechar())) {
            // with type, drop type info
            delete r.value;
            r.value = this._value();
        }
        return r;
    }

    /**
     * Get next 'String', have some hack to work with non standard tjson
     * @private @static
     */
    private _string(): string {
        let r = "";
        let type = this._nextnechar();
        if (!"\"'".includes(type)) type = " \f\n\r\t\v,\"':[]";
        else this.ptr++;
        while (!type.includes(this.str[this.ptr])) {
            r += this.str[this.ptr];
            this.ptr++;
        }
        if ("\"'".includes(type)) this.ptr++;
        return r;
    }
}
// window.TJSON = TJSON;