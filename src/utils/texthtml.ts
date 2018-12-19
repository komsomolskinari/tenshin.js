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
    const funcAndPos: { pos: number, func: KSFunc }[] = [];
    tokens.forEach(t => {
        if (t[0] === "[") {
            funcAndPos.push({ pos: rawString.length, func: KSParser.parse(t)[0] as KSFunc });
        }
        else {
            rawString += t;
        }
    });
    let _pos = 0;
    let ret = "";
    funcAndPos.forEach(t => {
        const { pos, func } = t;
        // append unformatted txt
        ret += rawString.substr(_pos, pos - _pos);
        switch (func.name) {
            case "ruby": // [ruby text='text']c
                ret += "<ruby>";
                ret += rawString[_pos];
                _pos++;
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
    ret += rawString.substr(_pos);
    return ret;
}
