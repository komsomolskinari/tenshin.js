// Kirikiri TPV JavaScript Object Notation to JSON
// TJSON: JSON of TJS, TJS is JavaScript(TM) like language, like JavaScript, it has JSON.
/**
 * @class TJSON Parser, 
 */
export default class TJSON {
    static Parse(str) {
        return new _TJSON().Parse(str);
    }
}
class _TJSON {
    /**
     * Get next non-empty char
     * @private @static
     * @param {Boolean} step Step to next char
     * @returns {String}
     */
    _nextnechar(step) {
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

    /**
     * Parse TJSON to object, just like JSON.Parse
     * @public @static
     * @param {String} str TJSON string
     * @returns {Object}
     */
    Parse(str) {
        this.str = ''
        this.ptr = 0;
        this.obj = null;

        if (str === undefined) return null;
        let lines = str.split('\n');
        for (let index = 0; index < lines.length; index++) {
            let element = lines[index];
            element = element.trim('\r');

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
    _value() {
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
    _obj() {
        let r = {};
        if (this._nextnechar(true) != '%') throw "fail";
        if (this._nextnechar(true) != '[') throw "fail";
        let lp = null;
        let br = true;
        read_token:
        while (br) {
            if (this._nextnechar() != ']') {
                lp = this._pair();
                r[lp[0]] = lp[1];
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
    _array() {
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
    _pair() {
        let r = [];
        r.push(this._string());
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
        r.push(this._value());
        // forward predict
        if (!",]".includes(this._nextnechar())) {
            // with type, drop type info
            r.pop();
            r.push(this._value());
        }
        return r;
    }

    /**
     * Get next 'String', have some hack to work with non standard tjson
     * @private @static
     */
    _string() {
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
window.TJSON = TJSON;