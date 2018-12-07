declare interface VMPosition {
    script: string
    line: number
}


declare interface Point {
    x: number,
    y: number
}

declare interface LayerInfo {
    name: string,
    offset?: Point,
    size?: Point
}

declare interface IndexItem {
    [name: string]: null | IndexItem
}
