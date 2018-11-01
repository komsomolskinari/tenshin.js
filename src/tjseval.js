// fake eval
// FAKE! MAGIC INCLUDED!
// only a = b + c
// a = "b"
// and a == b
// will be eval
export function TJSeval(str, klass) {
    if (Object.keys(klass.TJShack).includes(str)) return klass.TJShack[str];

    // hack for opr1,opr2
    let commaindex = str.indexOf(',');
    if (commaindex >= 0) {
        let ret;
        str.split(',').forEach(s => ret = TJSeval(s, klass));
        return ret;
    }

    str = str.trim();
    //hack for ++ --
    switch (str.substr(str.length - 2)) {
        case '++':
            klass.TJSvar[str.substr(0, str.length - 2).trim()]++;
            return 1;
            break;
        case '--':
            klass.TJSvar[str.substr(0, str.length - 2).trim()]++;
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
    rexp = rexp.trim().replace(/([+\-\*\/])/g, " $1 ").split(/ +/g);
    if (rexp.length == 1) {
        // a == b or a = b
        if (rexp[0][0] == '"') rvalue = rexp[0].substr(1, rexp[0].length - 2);
        else if ("0123456789".includes(rexp[0][0])) rvalue = parseInt(rexp[0]);
        else rvalue = klass.TJSvar[rexp[0]];
    }
    else {
        var rv1;
        var rv2;
        // a ==/= b opr c
        // use standard stack mode to handle rvalue
        for (const r of rexp) {
            if (rexp[0][0] == '"') rv1 = rexp[0].substr(1, rexp[0].length - 2);
            else if ("0123456789".includes(rexp[0][0])) rv1 = parseInt(rexp[0]);
            else rv1 = klass.TJSvar[rexp[0]];
            if (rexp[2][0] == '"') rv2 = rexp[2].substr(1, rexp[2].length - 2);
            else if ("0123456789".includes(rexp[2][0])) rv2 = parseInt(rexp[2]);
            else rv2 = klass.TJSvar[rexp[2]];
        }
        // +-*/ switch
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

    if (returnBool) {
        var lv;
        if (lvalue[0] == '"') lv = lvalue.substr(1, lvalue.length - 2);
        else if ("0123456789".includes(lvalue[0])) lv = parseInt(lvalue);
        else lv = klass.TJSvar[lvalue];
        if ((lv - rvalue) * (lv - rvalue) < 0.0001) return true;
        else return false;
    }
    else {
        klass.TJSvar[lvalue] = rvalue;
        return rvalue;
    }
}