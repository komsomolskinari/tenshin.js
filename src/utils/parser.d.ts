type JSONObject = PrimitiveObject | Array<any> | string | number | boolean | null
type PrimitiveType = string | number | boolean | null | undefined
declare interface KeyValuePair {
    key: string,
    value: JSONObject,
}
declare interface PrimitiveObject {
    [key: string]: JSONObject
}
interface KSLine {
    type: string,
    name: string,
    display?: string,
    text?: string,
    param?: PrimitiveObject,
    option?: string[], // string array, convert on demand
}
