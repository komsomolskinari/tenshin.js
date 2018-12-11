import KSParser from "./ksparser";
/**
 * convert text with ks format cmd to html
 * @param txt Text with KAG tag
 * @returns KAG tag converted to html tag
 */
export default function TextHTML(txt: string) {
    if (txt.indexOf("[") < 0) return txt;
    // first, cut to lines: text\n[cmd]\ntext
    const tokens = txt
        .replace(/\[/g, "\n[")
        .replace(/\]/g, "]\n")
        .split("\n");
    // generate raw text and cmd position
    let rawString = "";
    // use KSParser to parse function
    const funcAndPos: [number, KSLine][] = [];
    tokens.forEach(t => {
        if (t[0] === "[") {
            funcAndPos.push([rawString.length, KSParser.parse(t)[0]]);
        }
        else {
            rawString += t;
        }
    });
    let pos = 0;
    let ret = "";
    funcAndPos.forEach(t => {
        let func: KSLine;
        // append unformatted txt
        ret += rawString.substr(pos, t[0] - pos);
        [pos, func] = t;
        switch (func.name) {
            case "ruby": // [ruby text='text']c
                ret += "<ruby>";
                ret += rawString[pos];
                pos++;
                ret += "<rt>";
                ret += func.param.text;
                ret += "</rt></ruby>";
                break;
            case "r":  // [r]
                ret += "<br />";
                break;
            default:
                console.warn("TextHTML, Unknown inline tag", func);
                break;
        }
    });
    ret += rawString.substr(pos);
    return ret;
}
