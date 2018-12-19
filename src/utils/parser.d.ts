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
    map?: number,
}

interface KSText {
    type: "text",
    name: string,
    display: string,
    text: string,
    map?: number,
}
interface KSFunc {
    type: "func",
    name: string,
    param: PrimitiveObject,
    option: string[],   // string array, convert on demand
    map?: number,
    trace?: VMPosition  // optional stack trace
}