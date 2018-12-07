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
                if (obj) return 'true';
                else return 'false';
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
            let subs = obj
                .map(o => this.stringify(o))
                .filter(o => o !== undefined);
            return `[${subs.join(',')}]`;
        }
        if (obj === null) { // null
            return 'null'
        }
        // this is for {} , or  %[]
        let s: string[] = Object.keys(obj).map(k => {
            let vs = this.stringify(obj[k]);
            if (vs === undefined) return undefined;
            else return `"${k}"=>${vs}`;
        }).filter(i => i !== undefined);
        return `%[${s.join(',')}]`;
    }


    /**
     * Get next non-empty char
     * @private @static
     * @param {Boolean} step Step to next char
     * @returns {String}
     */
    private _nextnechar(step?: boolean) {
        let ret = null;
        for (; this.ptr < this.str.length; this.ptr++) {
            if (!" \f\n\r\t\v".includes(this.str[this.ptr])) {
                ret = this.str[this.ptr];
                break;
            }
        }
        if (step == true) this.ptr++;
        return ret;
    }

    str: string = '';
    ptr: number = 0;
    obj: JSONObject = null;
    /**
     * Parse TJSON to object, just like JSON.Parse
     * @public @static
     * @param {String} str TJSON string
     * @returns {PrimitiveObject}
     */
    private _parse(str: string): JSONObject {
        this.str = ''
        this.ptr = 0;
        this.obj = null;

        if (str === undefined) return null;
        let lines = str.split('\n');
        for (let index = 0; index < lines.length; index++) {
            let element = lines[index];
            element = element.replace(/^\r+|\r+$/g, '');
            // remove comment so we neednt parse it
            let idx = element.indexOf('//')
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
            case '%':
                r = this._obj();
                break;
            case '[':
                r = this._array();
                break;
            case null:
                throw "fail";
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
        let r: PrimitiveObject = {};
        if (this._nextnechar(true) != '%') throw "fail";
        if (this._nextnechar(true) != '[') throw "fail";
        let lp = null;
        let br: boolean = true;
        read_token:
        while (br) {
            if (this._nextnechar() != ']') {
                lp = this._pair();
                r[lp.key] = lp.value;
            }
            else {
                this.ptr++;
                break read_token;
            }
            switch (this._nextnechar(true)) {
                case ',':
                    break;
                case ']':
                    break read_token;
                default:
                    throw "fail";
            }
        }
        return r;
    }

    /**
     * Get next 'Array' ([value1,...])
     * @private @static
     */
    private _array(): Array<any> {
        let r = [];
        if (this._nextnechar(true) != '[') throw "fail";
        let br = true;
        read_token:
        while (br) {
            if (this._nextnechar() != ']') {
                r.push(this._value());
            }
            else {
                this.ptr++;
                break read_token;
            }
            switch (this._nextnechar(true)) {
                case ',':
                    break;
                case ']':
                    break read_token;
                default:
                    throw "fail";
            }
        }
        return r;
    }

    /**
     * Get next 'key-value pair' (key1=>value1)
     * @private @static
     */
    private _pair(): KeyValuePair {
        let r: KeyValuePair = { key: '', value: '' };
        r.key = this._string();
        switch (this._nextnechar(true)) {
            case '=':
                if (this._nextnechar(true) != '>') {
                    throw "fail"
                }
                break;
            case ':':
                break;
            default:
                throw "fail";
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
        let r = '';
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
//window.TJSON = TJSON;