declare type KSLine = KSEntry | KSText | KSFunc

declare interface KSEntry {
    type: "entry",
    name: string,
    map?: number,
    repl?: boolean,
}

declare interface KSText {
    type: "text",
    name: string,
    display: string,
    text: string,
    map?: number,
    repl?: boolean,
}

declare interface KSFunc {
    type: "func",
    name: string,
    param: {
        [key: string]: string
    },
    option: string[],   // string array, convert on demand
    map?: number,
    trace?: VMPosition  // optional stack trace
    repl?: boolean,     // REPL flag, affected on logging
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