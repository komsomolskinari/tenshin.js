declare interface VMPosition {
    script: string
    line: number
}

declare interface Point {
    /**
     * @property x left, width
     */
    x: number,  // left, width
    /**
     * @property y top, height
     */
    y: number   // top, height
}

declare interface LayerInfo {
    name: string,
    offset?: Point,
    size?: Point
}

declare interface IndexItem {
    [name: string]: null | IndexItem
}
