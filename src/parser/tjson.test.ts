import TJSON from "./tjson";
test("empty", () => {
    expect(() => TJSON.parse("")).toThrow();
});
test("empty string", () => {
    expect(() => TJSON.parse(" ")).toThrow();
});
test("jsonObject", () => {
    expect(() => TJSON.parse("{}")).toThrow();
});
test("true", () => {
    expect(TJSON.parse("true")).toEqual(true);
});
test("false", () => {
    expect(TJSON.parse("false")).toEqual(false);
});
test("null", () => {
    // tslint:disable-next-line:no-null-keyword
    expect(TJSON.parse("null")).toEqual(null);
});
test("string", () => {
    expect(TJSON.parse("'1234567890'")).toEqual("1234567890");
});
test("number", () => {
    expect(TJSON.parse("1234567890")).toEqual(1234567890);
});
test("fpnumber", () => {
    expect(TJSON.parse("1234567.890")).toEqual(1234567.890);
});
test("fpnumber2", () => {
    expect(TJSON.parse("-12.3e4")).toEqual(-12.3e4);
});
test("hex number", () => {
    expect(TJSON.parse("%['lightColor' => 0xc0000040]")).toEqual({ lightColor: 0xc0000040 });
});
test("object", () => {
    expect(TJSON.parse("%[]")).toEqual({});
});
test("object with null data", () => {
    // tslint:disable-next-line:no-null-keyword
    expect(TJSON.parse("%['k'=>null]")).toEqual({ k: null });
});
test("array", () => {
    expect(TJSON.parse("[]")).toEqual([]);
});
test("array with data", () => {
    expect(TJSON.parse("[123,456,'789']")).toEqual([123, 456, "789"]);
});
test("object with data", () => {
    expect(TJSON.parse("%['k'=>'v']")).toEqual({ k: "v" });
});
test("object with two key", () => {
    expect(TJSON.parse("%['k'=>'v',     \"k2\"=> 'v2']")).toEqual({ k: "v", k2: "v2" });
});
test("empty padding string", () => {
    expect(TJSON.parse("       \t  '1234567890'\t\t\t")).toEqual("1234567890");
});
test("nesting object", () => {
    expect(TJSON.parse("%[\"key\"=>%[\"key2\"=>123],\"key3\"=>[456,789]]"))
        .toEqual({ key: { key2: 123 }, key3: [456, 789] });
});
test("colonless key", () => {
    expect(TJSON.parse("%[k=>v]")).toEqual({ k: "v" });
});
test("json compatiable kvpair", () => {
    expect(TJSON.parse("%[level:4, opacity:255, origin:1, vorigin:1, noshift:true]"))
        .toEqual({ level: 4, opacity: 255, origin: 1, vorigin: 1, noshift: true });
});
test("kag.env", () => {
    expect(TJSON.parse("%[\"type\" => KAGEnvironment.LEVEL,\"level\" => int 0]"))
        .toEqual({ type: "KAGEnvironment.LEVEL", level: 0 });
});
test("single line comment", () => {
    expect(TJSON.parse("[123// comment\n,456,// comment\r'789']")).toEqual([123, 456, "789"]);
});
test("multi line comment", () => {
    expect(TJSON.parse("[123// comment\n,456,/* comment\raaaaaa{} a*/'789']")).toEqual([123, 456, "789"]);
});
test("optional comma for array", () => {
    expect(TJSON.parse("[123,456,'789',]")).toEqual([123, 456, "789"]);
});
test("optional comma for object", () => {
    expect(TJSON.parse("%['k'=>'v','k2'=> 'v2',]")).toEqual({ k: "v", k2: "v2" });
});
