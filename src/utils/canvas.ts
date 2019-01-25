import FilePath from "./filepath";
import { createElem } from "./dom";

export default async function LayersToBlob(layers: LayerInfo[], size?: Point): Promise<Blob> {
    let maxW = Number.MIN_SAFE_INTEGER;
    let maxH = Number.MIN_SAFE_INTEGER;
    let minW = Number.MAX_SAFE_INTEGER;
    let minH = Number.MAX_SAFE_INTEGER;
    const layerByArea: Map<number, LayerInfo> = new Map();

    await Promise.all(layers.map(l =>
        (async () => {
            const size = await GetLayerSize(l.name);
            const offset = l.offset || GetLayerOffset(l.name);
            UpdateLayer(l.name, size, offset);
            layerByArea.set(size.x * size.y + Math.random(), { name: l.name, size, offset });
            minW = minW < offset.x ? minW : offset.x;
            minH = minH < offset.y ? minH : offset.y;
            maxW = maxW > (size.x + offset.x) ? maxW : size.x + offset.x;
            maxH = maxH > (size.y + offset.y) ? maxW : size.y + offset.y;
        })()
    ));

    const realLayers: LayerInfo[] = [...new Map([...layerByArea.entries()].sort()).values()].reverse();

    if (!size || !isFinite(size.x) || !isFinite(size.y)) {
        size = { x: maxW, y: maxH };
    }
    console.log("Use canvas size", size);
    console.dir(realLayers);
    const canvas = createElem("canvas") as HTMLCanvasElement;
    canvas.width = size.x;
    canvas.height = size.y;
    const ctx = canvas.getContext("2d");
    realLayers.forEach(l => {
        const img = layerFD.get(l.name);
        ctx.drawImage(layerFD.get(l.name), l.offset.x, l.offset.y);
    });

    let blobReady: (arg: Blob) => void = () => 0;
    const p: Promise<Blob> = new Promise((r, ign) => blobReady = r);
    canvas.toBlob(blobReady);
    return p;
}

async function GetLayerSize(layerName: string): Promise<Point> {
    const info = layerMetrics.get(layerName);
    if (info !== undefined && info.size !== undefined) return info.size;
    let loadResolve, loadReject;
    const loadPromise = new Promise((resolve, reject) => {
        loadResolve = resolve;
        loadReject = reject;
    });
    const img = new Image();
    img.src = FilePath.findByType(layerName, "image");
    img.onload = loadResolve;
    img.onerror = loadReject;
    await loadPromise;
    layerFD.set(layerName, img);
    return {
        x: img.naturalWidth,
        y: img.naturalHeight,
    };
}

function GetLayerOffset(layerName: string): Point {
    const info = layerMetrics.get(layerName);
    if (info !== undefined && info.offset !== undefined) return info.offset;
    else return undefined;
}

function UpdateLayer(layerName: string, size: Point, offset: Point) {
    layerMetrics.set(layerName, { name: layerName, size, offset });
}


const layerMetrics: Map<string, LayerInfo> = new Map();
const layerFD: Map<string, HTMLImageElement> = new Map();