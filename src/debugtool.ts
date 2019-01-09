import KSParser from "./utils/ksparser";
import KSVM from "./ksvm";

let layerListElem: HTMLSelectElement;
let layerLogElem: HTMLUListElement;
let lastLayerCmdElem: HTMLParagraphElement;
let layerLogCountElem: HTMLInputElement;
let ksREPLElem: HTMLInputElement;
export function DebugInit() {
    layerLogElem = document.getElementById("layerlog") as HTMLUListElement;
    layerLogCountElem = document.getElementById("layerlogcount") as HTMLInputElement;
    layerListElem = document.getElementById("layerlist") as HTMLSelectElement;
    lastLayerCmdElem = document.getElementById("lastlayercmd") as HTMLParagraphElement;
    ksREPLElem = document.getElementById("ksrepl") as HTMLInputElement;
    document.getElementById("execrepl").addEventListener("click", (ev) => {
        KSVM.Step(KSParser.parse(ksREPLElem.value)[0]);
    });
    layerListElem.addEventListener("change", (ev) => {
        ShowLog(layerListElem.value);
    });
}

const layerCmdLog: {
    [key: string]: string[]
} = {};
export function LogLayerCmd(name: string, cmd: KSFunc) {
    if (layerCmdLog[name] === undefined) {
        const o = document.createElement("option");
        o.value = name;
        o.innerText = name;
        layerListElem.appendChild(o);
        layerCmdLog[name] = [];
    }
    layerCmdLog[name].push(KSParser.stringify([cmd]));
    lastLayerCmdElem.innerText = KSParser.stringify([cmd]);
    ShowLog(layerListElem.value);
}

function ShowLog(name: string) {
    const layerLog = layerCmdLog[name];
    const selectedLog = layerLog === undefined ? [] : layerLog.slice(-layerLogCountElem.value);
    layerLogElem.innerHTML = selectedLog.reduce((p, c) => `${p}<li>${c}</li>`, "");
}

export function LogVMCmd(cmd: KSLine, repl?: boolean) {
    const vCmdCSS = {
        entry: "color:grey",
        func: "color:pink",
        text: "color:grey"
    };
    console.debug("%c%s", repl ? "color:red" : vCmdCSS[cmd.type], KSParser.stringify([cmd], true));
}

