import TextHTML from "./texthtml";

test("raw", () => {
    expect(TextHTML("asdf")).toBe("asdf");
});