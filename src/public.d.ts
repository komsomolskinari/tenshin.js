declare interface VMPosition {
    script: string,
    line: number,
}

declare interface JumpDest {
    script: string,
    target: string,
}

declare interface Point {
    x: number,  // left, width
    y: number,  // top, height
}

declare interface LayerInfo {
    name: string,
    offset?: Point,
    size?: Point,
}

declare interface IndexItem {
    [name: string]: null | IndexItem,
}

declare interface SoundEvent {
    time: number,
    type: string,
    data: string | number,
}
