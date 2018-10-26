// Kirikiri TPV JavaScript Object Notation to JSON
// TJSON: JSON of TJS, TJS is JavaScript™ like language, like JavaScript, it has JSON.
export class TJSON {
    // get next not empty char
    static _nextnechar(step) {
        var ret = null;
        for (; this.ptr < this.str.length; this.ptr++) {
            if (!" \f\n\r\t\v".includes(this.str[this.ptr])) {
                ret = this.str[this.ptr];
                break;
            }
        }
        if (step == true) this.ptr++;
        return ret;
    }

    static Parse(str) {
        this.str = ''
        this.ptr = 0;
        this.obj = null;

        if (str === undefined) return null;
        var lines = str.split('\n');
        for (let index = 0; index < lines.length; index++) {
            var element = lines[index];
            element = element.trim('\r');

            // remove comment so we neednt parse it
            let idx = element.indexOf('//')
            this.str += idx >= 0 ? element.substring(0, idx) : element;
        }
        this.obj = this._value();
        return this.obj;
    }

    static _value() {
        var r;
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

    static _obj() {
        var r = {};
        if (this._nextnechar(true) != '%') throw "fail";
        if (this._nextnechar(true) != '[') throw "fail";
        var lp = null;
        var br = true;
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

    static _array() {
        var r = [];
        if (this._nextnechar(true) != '[') throw "fail";
        var br = true;
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
    // return [key,value]
    static _pair() {
        var r = [];
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

    static _string() {
        var r = '';
        var type = this._nextnechar();
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