// runtime libs

export class Runtime {
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
        this.SelectData = [];
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