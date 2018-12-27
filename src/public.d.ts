declare interface VMPosition {
    script: string,
    line: number,
}

declare interface JumpDest {
    script: string;
    target: string;
}

declare interface Point {
    x: number;  // left, width
    y: number;  // top, height
}

declare interface LayerInfo {
    name: string;
    offset?: Point;
    size?: Point;
}

declare interface IndexItem {
    [name: string]: null | IndexItem;
}

declare interface LayerControlData {
    name: string;
    layer: LayerInfo[];
    reload?: boolean;
    offset?: Point;
    zoom?: number;
    zoomCenter?: Point;
}
