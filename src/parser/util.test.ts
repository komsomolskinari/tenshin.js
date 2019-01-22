import { AutoType } from "./krcsv";

test("empty str is undefined", () => expect(AutoType("")).toEqual(undefined));
test("int str is int", () => expect(AutoType("123456")).toEqual(123456));
test("float str is float", () => expect(AutoType("1.23")).toEqual(1.23));
test("0 str is 0", () => expect(AutoType("0")).toEqual(0));
test("float 0 str is 0", () => expect(AutoType("0.0")).toEqual(0));
test("str is str", () => expect(AutoType("test string")).toEqual("test string"));
