declare type JSONObject = PrimitiveObject | Array<any> | string | number | boolean | null
declare type PrimitiveType = string | number | boolean | null | undefined
declare interface KeyValuePair {
    key: string,
    value: JSONObject,
}
declare interface PrimitiveObject {
    [key: string]: JSONObject
}

declare type KSLine = KSEntry | KSText | KSFunc

declare interface KSEntry {
    type: "entry",
    name: string,
    map?: number,
}

declare interface KSText {
    type: "text",
    name: string,
    display: string,
    text: string,
    map?: number,
}

declare interface KSFunc {
    type: "func",
    name: string,
    param: PrimitiveObject,
    option: string[],   // string array, convert on demand
    map?: number,
    trace?: VMPosition  // optional stack trace
}

declare type SoundLoopInfo = SLILink | SLILabel;
declare interface SLILink {
    type: "link",
    from: number,
    to: number,
    smooth: boolean,
    condition: string,
    refvalue: number,
    condvar: number
}

declare interface SLILabel {
    type: "label",
    position: number,
    name: string
}