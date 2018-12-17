import KSParser from "./ksparser";

test("empty", () => {
    expect(KSParser.parse("")).toEqual([]);
});
test("minimal func", () => {
    expect(KSParser.parse("[f]"))
        .toEqual([{ type: "func", name: "f", option: [], param: {} }]);
});
test("func option", () => {
    expect(KSParser.parse("[f opt 101]"))
        .toEqual([{ type: "func", name: "f", option: ["opt", "101"], param: {} }]);
});
test("func param", () => {
    expect(KSParser.parse("[f opt=101]"))
        .toEqual([{ type: "func", name: "f", option: [], param: { opt: 101 } }]);
});
test("mix func", () => {
    expect(KSParser.parse("[f opt param=poi]"))
        .toEqual([{ type: "func", name: "f", option: ["opt"], param: { param: "poi" } }]);
});
test("empty param", () => {
    expect(KSParser.parse("[f opt=]"))
        .toEqual([{ type: "func", name: "f", option: [], param: { opt: undefined } }]);
});
test("colon param", () => {
    expect(KSParser.parse("[f opt='opt']"))
        .toEqual([{ type: "func", name: "f", option: [], param: { opt: "opt" } }]);
});
test("space padding", () => {
    expect(KSParser.parse("  [ f  opt =\t     opt 123 ] "))
        .toEqual([{ type: "func", name: "f", option: ["123"], param: { opt: "opt" } }]);
});
test("space padding colon param", () => {
    expect(KSParser.parse("[f opt= 'opt']"))
        .toEqual([{ type: "func", name: "f", option: [], param: { opt: "opt" } }]);
});
test("colon in colon", () => {
    expect(KSParser.parse("[eval exp='f.voiceBase=\"001\"']"))
        .toEqual([{ type: "func", name: "eval", option: [], param: { exp: "f.voiceBase=\"001\"" } }]);
});
test("entry", () => {
    expect(KSParser.parse("*tag1|test")).toEqual([{ type: "entry", name: "tag1" }]);
});
test("text", () => {
    expect(KSParser.parse("所谓【ｋｉｓｓ】"))
        .toEqual([{ type: "text", name: undefined, text: "所谓【ｋｉｓｓ】", display: undefined }]);
});
test("text with name", () => {
    expect(KSParser.parse("【芳乃】「请收下我的处女之身」"))
        .toEqual([{ type: "text", name: "芳乃", text: "「请收下我的处女之身」", display: undefined }]);
});
test("text with rewrited name", () => {
    expect(KSParser.parse("【神様/佐奈？】「お兄ちゃん、起きて。お兄ちゃん」"))
        .toEqual([{ type: "text", name: "神様", text: "「お兄ちゃん、起きて。お兄ちゃん」", display: "佐奈？" }]);
});
test("multiple func in one line", () => {
    expect(KSParser.parse("[f1]     \f [f2]"))
        .toEqual([
            { type: "func", name: "f1", option: [], param: {} },
            { type: "func", name: "f2", option: [], param: {} }]);
});
test("func with extra text", () => {
    expect(KSParser.parse("[f1]   \ttxt"))
        .toEqual([
            { type: "func", name: "f1", option: [], param: {} },
            { type: "text", name: undefined, text: "txt", display: undefined }]);
});
test("text with inline function", () => {
    expect(KSParser.parse("【佐奈】「うぅぅーー！　兄さんを[ruby text=\"けが\"]汚した張本人は黙ってて下さい！」"))
        .toEqual([{ type: "text", name: "佐奈", text: "「うぅぅーー！　兄さんを[ruby text=\"けが\"]汚した張本人は黙ってて下さい！」", display: undefined }]);
});
test("parse real script", () => {
    expect(KSParser.parse(
        `
*0408|オープニング

[initscene]

[eval exp='f.voiceBase="001"']
[神様 voice=1]
;[一同 voice=1]
;●４月８日（月曜日）
[date 0408 hide]
;■■■■■暗転■■■■■

キス　【ｋｉｓｓ】
[bgm storage="bgm13"]
;[神様 ]
【神様/？？？】「んっ……んっ」
`))
        .toEqual([
            { type: "entry", name: "0408" },
            { type: "func", name: "initscene", option: [], param: {} },
            { type: "func", name: "eval", option: [], param: { exp: "f.voiceBase=\"001\"" } },
            { type: "func", name: "神様", option: [], param: { voice: 1 } },
            { type: "func", name: "date", option: ["0408", "hide"], param: {} },
            { type: "text", name: undefined, text: "キス　【ｋｉｓｓ】", display: undefined },
            { type: "func", name: "bgm", option: [], param: { storage: "bgm13" } },
            { type: "text", name: "神様", text: "「んっ……んっ」", display: "？？？" },
        ]);
});
