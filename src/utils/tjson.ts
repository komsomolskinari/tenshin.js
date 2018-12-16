/// <reference path="./parser.d.ts" />
/**
 * @class TJSON Parser
 * Kirikiri TPV JavaScript Object Notation to JSON
 * TJSON: JSON of TJS, TJS is JavaScript(TM) like language, like JavaScript, it has JSON.
 * Parser modified from https://github.com/douglascrockford/JSON-js
 */
export default class TJSON {
    /**
     * JSON.parse in TJS world
     * @param text
     */
    static parse(text: string): any {
        let currentPosition = 0;
        let currentChar = " ";
        let str: string;
        const escapee: {
            [key: string]: string
        } = {
            "\"": "\"",
            "\\": "\\",
            "/": "/",
            "b": "\b",
            "f": "\f",
            "n": "\n",
            "r": "\r",
            "t": "\t"
        };
        const seprator = "\"\\+-*/\f\n\r\t '%[]:=><{},?";
        function error(message?: string) {
            throw new SyntaxError(message);
        }
        function next(char?: string) {
            if (char && char !== currentChar) {
                error(`Expected ${char}, got ${currentChar} at ${currentPosition}`);
            }
            currentChar = str.charAt(currentPosition);
            currentPosition++;
            return currentChar;
        }
        function white() {
            while (currentChar && currentChar <= " ") next();
        }
        function number() {
            let value;
            let nstring = "";
            if (currentChar === "-") {
                nstring = "-";
                next("-");
            }
            while (currentChar >= "0" && currentChar <= "9") {
                nstring += currentChar;
                next();
            }
            if (currentChar === ".") {
                nstring += ".";
                while (next() && currentChar >= "0" && currentChar <= "9") {
                    nstring += currentChar;
                }
            }
            else if (currentChar === "x" || currentChar === "X") {
                nstring += currentChar;
                while (next() && (
                    (currentChar >= "0" && currentChar <= "9")
                    || (currentChar >= "a" && currentChar <= "f")
                    || (currentChar >= "A" && currentChar <= "F"))) {
                    nstring += currentChar;
                }
            }
            if (currentChar === "e" || currentChar === "E") {
                nstring += currentChar;
                currentChar = next();
                if (currentChar === "-" || currentChar === "+") {
                    nstring += currentChar;
                    next();
                }
                while (currentChar >= "0" && currentChar <= "9") {
                    nstring += currentChar;
                    next();
                }
            }
            value = +nstring;
            if (!isFinite(value)) {
                error(`Bad number at ${currentPosition}, ${nstring}`);
            } else {
                return value;
            }
        }
        function string() {
            let hex;
            let i;
            let value = "";
            let uffff;
            // When parsing for string values, we must look for " and \ characters.
            const charsep = currentChar;
            if (charsep !== "'" && charsep !== "\"") {
                white();
                do {
                    if (seprator.includes(currentChar)) break;
                    value += currentChar;
                } while (next());
                if (value.length === 0) error(`Empty colonless string at ${currentPosition}, char is ${currentChar}`);
                else return value;
            }
            while (next()) {
                if (currentChar === charsep) {
                    next();
                    return value;
                }
                if (currentChar === "\\") {
                    currentChar = next();
                    if (currentChar === "u") {
                        uffff = 0;
                        for (i = 0; i < 4; i += 1) {
                            hex = parseInt(next(), 16);
                            if (!isFinite(hex)) {
                                break;
                            }
                            uffff = uffff * 16 + hex;
                        }
                        value += String.fromCharCode(uffff);
                    } else if (typeof escapee[currentChar] === "string") {
                        value += escapee[currentChar];
                    } else {
                        break;
                    }
                } else {
                    value += currentChar;
                }
            }
            error(`Bad string at ${currentPosition}, with ${currentChar}`);
        }
        function word() {
            const contextChar = currentChar;
            const context = currentPosition;
            switch (currentChar) {
                case "t":
                    next("t");
                    next("r");
                    next("u");
                    next("e");
                    return true;
                case "f":
                    next("f");
                    next("a");
                    next("l");
                    next("s");
                    next("e");
                    return false;
                case "n":
                    next("n");
                    next("u");
                    next("l");
                    next("l");
                    // tslint:disable-next-line:no-null-keyword
                    return null;
            }
            currentPosition = context;
            return (contextChar >= "0" && contextChar <= "9")
                ? number()
                : string();
        }
        function value() {
            white();
            switch (currentChar) {
                case "%":
                    return object();
                case "[":
                    return array();
                case "\"":
                case "'":
                    return string();
                case "-":
                    return number();
                default:
                    return (currentChar >= "0" && currentChar <= "9")
                        ? number()
                        : word();
            }
        }
        function array() {
            const arr: any[] = [];
            if (currentChar === "[") {
                currentChar = next("[");
                white();
                if (currentChar === "]") {
                    next("]");
                    return arr;   // empty array
                }
                while (currentChar) {
                    if (currentChar === "]") {
                        next("]");
                        return arr;
                    }
                    arr.push(value());
                    white();
                    if (currentChar === "]") {
                        next("]");
                        return arr;
                    }
                    next(",");
                    white();
                }
            }
            error("Bad array");
        }
        function object() {
            let key;
            const obj: {
                [key: string]: any
            } = {};

            if (currentChar === "%") {
                next("%");
                currentChar = next("[");
                white();
                if (currentChar === "]") {
                    next("]");
                    return obj;   // empty object
                }
                while (currentChar) {
                    white();
                    // obj, ]
                    if (currentChar === "]") {
                        next("]");
                        return obj;
                    }
                    key = string();
                    white();
                    if (currentChar === ":") next(":");
                    else {
                        next("=");
                        next(">");
                    }

                    obj[key] = value();
                    white();
                    while (currentChar !== ",") {
                        if (currentChar === "]") {
                            next("]");
                            return obj;
                        }
                        // reload value
                        obj[key] = value();
                        white();
                    }
                    next(",");
                    white();
                }
            }
            error(`Bad object at ${currentPosition}, with ${currentChar}`);
        }
        function json() {
            let result;
            result = value();
            return result;
        }

        str = text
            .replace(/\/\/[^\r\n]*[\r\n]/gm, " ")
            .replace(/\/\*[^\*]*\*\//gm, " ");
        return json();
    }
    /**
     * JSON.stringify in TJS world
     * @param obj
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
}
