import TextHTML from "./texthtml";

test("Raw", () => {
    expect(TextHTML("asdf")).toBe("asdf");
});
test("Unicode", () => {
    expect(TextHTML("苟利国家生死以")).toBe("苟利国家生死以");
});
test("[r] tag", () => {
    expect(TextHTML("R tag[r]Here")).toBe("R tag<br />Here");
});
test("[ruby] tag", () => {
    expect(TextHTML("tag[ruby text=ruby]atagged")).toBe("tag<ruby>a<rt>ruby</rt></ruby>tagged");
});
