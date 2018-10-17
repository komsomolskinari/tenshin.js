/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tjson__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _ksparser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _ksvm__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);
/* harmony import */ var _runtime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4);





var scenes = [];
var RT = new _runtime__WEBPACK_IMPORTED_MODULE_3__["Runtime"]();
var VM = new _ksvm__WEBPACK_IMPORTED_MODULE_2__["KSVM"](RT);

RT.TJShack =
    {
        "f.all_clear_check=(sf.sakuya_clear && sf.ruri_clear && sf.sana_clear && sf.aoi_clear && sf.mahiro_clear && sf.yukari_clear)": 1,
        "!(f.sak_flag == 5 || f.all_clear_check)": true,
    };
RT.TJSvar["f.all_clear_check"] = true;
RT.TJSvar["!kag.isRecollection"] = true;
RT.TJSvar["f.sak_flag"] = 0;
RT.TJSvar["f.san_flag"] = 0;
RT.TJSvar["f.aoi_flag"] = 0;
RT.TJSvar["f.mah_flag"] = 0;
RT.TJSvar["f.rur_flag"] = 0;
RT.TJSvar["f.yuk_flag"] = 0;

window.RT = RT;
window.VM = VM;
$(document).ready(() => {
    $.get("game/main/envinit.tjs", (d, s, x) => { _tjson__WEBPACK_IMPORTED_MODULE_0__["TJSON"].Parse(d); });
    $.get("game/scenario/", (d, s, x) => {
        for (const key in d) {
            if (d.hasOwnProperty(key)) {
                const elm = d[key];
                if (elm.type == "file") {
                    scenes.push(elm.name.split('.')[0]);
                }
            }
        }

        for (const s of scenes) {
            $.get("game/scenario/" + s + ".ks", (d, st, x) => {
                var spt = _ksparser__WEBPACK_IMPORTED_MODULE_1__["KSParser"].Parse(d);
                VM.AddScript(s, spt)
            });
        }
    });
});

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TJSON", function() { return TJSON; });
// Kirikiri TPV JavaScript Object Notation to JSON

/*
json: value;
pair: STRING ('=>' | ':') value;
obj: '%[' ((pair ',')* pair ','?)? ']';
array: '[' ((value ',')* value ','?)? ']';
value: STRING | obj | array;
STRING: STRINGD | STRINGS | SPSTRING;
STRINGD: '"' .? '"';
STRINGS: '\'' .? '\'';
SPSTRING: ' ' .+ ' ';
*/
class TJSON {
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

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KSParser", function() { return KSParser; });
// KAG Script virtual machine
class KSParser {
    static Parse(str) {
        this.cmd = [];
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
                    var n = element.substr(1).trim();
                    this.cmd.push({ "type": "entry", "name": n.split('|')[0] });
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
            const key = k[index];
            const value = v[index];

            // key = value
            if (key && value) {
                ret.param[key] = value;
            }
            // key
            else if (key) {
                ret.option.push(key);
            }
        }
        return ret;
    }

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


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KSVM", function() { return KSVM; });
/* harmony import */ var _runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);


// when to hang up vm
let VM_STEP = 0;
let VM_SCENE = 1;
let VM_SELECT = 2;
let VM_NEVER = 3;
// vm display mode
let VM_NORMAL = 0; // standard mode
let VM_AUTO = 1; // wait for voice end
let VM_QUICK = 2; // fixed interval
let VM_NONE = 3; // no output

class KSVM {

    constructor(runtime) {
        this.runtime = runtime;
        runtime.vm = this;
        this.runmode = VM_SCENE;
        this.dispmode = VM_NORMAL;
        this.hang = false;
        // scripts = {name: script}
        this.scripts = {};
        this.tags = {};
        // [script name, line#]
        this.currentpos = { "script": null, "line": 1 };

        this.posstack = [];
        this.runlock = false;
    }

    AddScript(name, script) {
        this.scripts[name] = script;
        // scan tags
        var lineno = 0;
        for (const s of script) {
            lineno++;
            if (s.type == "entry") {
                this.tags[s.name] = { "script": name, "line": lineno };
            }
        }
    }

    // .
    Next() {
        this.runmode = VM_SCENE;
        this.dispmode = VM_NORMAL;
        this.hang = false;
        this.Run();
    }

    // >
    Auto() {
        this.runmode = VM_SELECT;
        this.dispmode = VM_AUTO;
        this.hang = false;
        this.Run();
    }

    // debug only
    Step() {
        this.runmode = VM_STEP;
        this.dispmode = VM_NORMAL;
        this.hang = false;
        this.Run();
    }

    // >> 
    Jump() {
        this.runmode = VM_NEVER;
        this.dispmode = VM_QUICK;
        this.hang = false;
        this.Run();
    }

    // >|
    NextSelect() {
        this.runmode = VM_SCENE;
        this.dispmode = VM_NONE;
        this.hang = false;
        this.Run();
    }

    // <
    BackLog() {

    }

    // <<
    Back() {

    }

    // |<
    LastSelect() {

    }

    // main entry
    Run() {
        if (this.runlock) return;
        this.runlock = true;
        while (!this.hang) {
            if (this.currentpos.line >= this.scripts[this.currentpos.script].length) {
                // too far
                this.hang = true;
                console.log("EOF");
                return;
            }
            const cmd = this.CurrentCmd();
            switch (cmd.type) {
                case "entry":
                    break;
                // begintrans = start transframe compile
                // about transframe mechanism:
                // begintrans
                // animation sequence
                // endtrans
                // text (play animation here)
                // let rtlib handle them
                case "func":
                    switch (cmd.name) {
                        case "next":
                            console.log('Try jump from', this.currentpos);
                            if (cmd.param.eval != undefined) {
                                // tjs eval
                                var r = this.runtime.TJSeval(cmd.param.eval);
                                if (!r) {
                                    console.log('Cancelled');
                                    break;
                                }
                                console.log('Confirmed');
                            }
                            if (cmd.param.target == undefined) {
                                this.currentpos = { "script": cmd.param.storage.split('.')[0], "line": 0 };
                            }
                            else {
                                this.currentpos = this.tags[cmd.param.target.substr(1)];
                            }
                            this.currentpos.line--;
                            console.log('To', this.currentpos, this.CurrentCmd());
                            break;
                        case "seladd":
                            this.runtime.SelectAdd(cmd);
                            break;
                        case "select":
                            let next = this.runtime.Select();
                            if (next !== undefined) {
                                this.currentpos = this.tags[next.substr(1)];
                                this.currentpos.line--;
                                console.log("Select, then jump to", this.currentpos);
                            }
                            break;
                        case "sysjump":
                            // special handling
                            console.log("finished");
                            break;
                        case "eval":
                            this.runtime.TJSeval(cmd.param.exp);
                            break;
                        default:
                            //console.log(this.currentpos, cmd);
                            break;
                    }
                    break;
                case "text":
                    // console.log(cmd);
                    this.runtime.Text(cmd);
                    if (this.runmode == VM_SCENE) this.hang = true;
                    break;
            }
            this.currentpos.line++;
        }
        this.runlock = false;
    }

    CurrentCmd() {
        return this.scripts[this.currentpos.script][this.currentpos.line]
    }

    // run from *tag, used for playback
    RunFrom(tag) {
        this.currentpos = this.tags[tag];
        this.Run();
    }

    // save internal status
    Save() {

    }

    // load
    Load(status) {

    }
}

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Runtime", function() { return Runtime; });
// runtime libs

class Runtime {
    constructor() {
        this.vm = null;
        // key: var name
        this.TJSvar = {};
        // set tjs eval native implement hack
        // only use when fail
        // key: input string
        // value: return value
        this.TJShack = {};
        this.MapSelectData = {};
        this.SelectData = [];
        window.TJSvar = this.TJSvar;
    }

    Text(cmd) {
        $('#chartxt').html(cmd.name);
    }

    // add map select option
    MapSelectAdd(cmd) {

    }

    // raise a map select
    MapSelect() {

    }

    SelectAdd(cmd) {
        this.SelectData.push([
            cmd.param.text,
            cmd.param.target,
            cmd.param.exp
        ]);
    }

    // raise a normal select
    Select() {
        var s = "";
        var n = 0;
        for (const d of this.SelectData) {
            s += n;
            s += d[0];
            s += '\n';
            n++;
        }
        var r = prompt(s, 0);
        var ro = this.SelectData[r];
        if (ro[2] !== undefined)
            this.TJSeval(ro[2]);
        return ro[1];
    }

    // fake eval
    // FAKE! HAVE SAFETY ISSUE!
    // only a = b + c
    // a = "b"
    // and a == b
    // will be eval
    TJSeval(str) {
        console.log("Eval", str);

        // hack for opr1,opr2
        let commaindex = str.indexOf(',');
        if (commaindex >= 0) {
            var ret;
            let s = str.split(',');
            for (const ss of s) {
                ret = this.TJSeval(ss);
            }
            return ret;
        }

        str = str.trim();
        //hack for ++ --
        switch (str.substr(str.length - 2)) {
            case '++':
                this.TJSvar[str.substr(0, str.length - 2).trim()]++;
                return 1;
                break;
            case '--':
                this.TJSvar[str.substr(0, str.length - 2).trim()]++;
                return 1;
                break;
        }

        var returnBool = (str.indexOf("==") >= 0);
        var sp = "=";
        if (returnBool) sp = "==";
        var lr = str.split(sp);
        var lvalue = lr[0];
        var rexp = lr[1];

        var rvalue = null;
        // cacluate rvalue
        rexp = rexp.trim().replace(/[+\-\*\/]/g, " $0 ").split(/ +/g);
        if (rexp.length == 1) {
            // a == b or a = b
            if (rexp[0][0] == '"') rvalue = rexp[0].substr(1, rexp[0].length - 2);
            else if ("0123456789".includes(rexp[0][0])) rvalue = parseInt(rexp[0]);
            else rvalue = this.TJSvar[rexp[0]];
        }
        else {
            var rv1;
            var rv2;
            // a ==/= b opr c
            // use standard stack mode to handle rvalue
            for (const r of rexp) {
                if (rexp[0][0] == '"') rv1 = rexp[0].substr(1, rexp[0].length - 2);
                else if ("0123456789".includes(rexp[0][0])) rv1 = parseInt(rexp[0]);
                else rv1 = this.TJSvar[rexp[0]];
                if (rexp[2][0] == '"') rv2 = rexp[2].substr(1, rexp[2].length - 2);
                else if ("0123456789".includes(rexp[2][0])) rv2 = parseInt(rexp[2]);
                else rv2 = this.TJSvar[rexp[2]];
            }
            switch (rexp[1][0]) {
                case '+':
                    rvalue = rv1 + rv2;
                    break;
                case '-':
                    rvalue = rv1 - rv2;
                    break;
                case '*':
                    rvalue = rv1 * rv2;
                    break;
                case '/':
                    rvalue = rv1 / rv2;
                    break;
                default:
                    rvalue = 0;
                    break;
            }
        }
        console.log(lvalue, rexp);
        if (rexp.length > 3 || str[0] == '!') {
            return this.TJShack[str];
        }
        if (returnBool) {
            var lv;
            if (lvalue[0] == '"') lv = lvalue.substr(1, lvalue.length - 2);
            else if ("0123456789".includes(lvalue[0])) lv = parseInt(lvalue);
            else lv = this.TJSvar[lvalue];
            if ((lv - rvalue) * (lv - rvalue) < 0.0001) return true;
            else return false;
        }
        else {
            this.TJSvar[lvalue] = rvalue;
            return rvalue;
        }
    }
}

/***/ })
/******/ ]);