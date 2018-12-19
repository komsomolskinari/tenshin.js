type JSONObject = PrimitiveObject | Array<any> | string | number | boolean | null
type PrimitiveType = string | number | boolean | null | undefined
declare interface KeyValuePair {
    key: string,
    value: JSONObject,
}
declare interface PrimitiveObject {
    [key: string]: JSONObject
}

type KSLine = KSEntry | KSText | KSFunc

interface KSEntry {
    type: "entry",
    name: string,
}

interface KSText {
    type: "text",
    name: string,
    display: string,
    text: string,
}
interface KSFunc {
    type: "func",
    name: string,
    param: PrimitiveObject,
    option: string[],   // string array, convert on demand
    trace?: VMPosition  // optional stack trace
}