import KSVM from "./ksvm";
import KSParser from "./parser/ksparser";
import { createElem, HTMLEscape } from "./utils/dom";

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
        const line = KSParser.parse(ksREPLElem.value)[0];
        line.repl = true;
        LogVMCmd(line, true);
        KSVM.Step(line);
    });
    layerListElem.addEventListener("change", (ev) => {
        ShowLog(layerListElem.value);
    });
}

const layerCmdLog: {
    [key: string]: string[]
} = {};
export function LogLayerCmd(layerName: string, cmd: KSFunc) {
    if (layerCmdLog[layerName] === undefined) {
        const o = createElem("option") as HTMLOptionElement;
        o.value = layerName;
        o.innerText = layerName;
        layerListElem.appendChild(o);
        layerCmdLog[layerName] = [];
    }
    const cmdstr = HTMLEscape(KSParser.stringify([cmd], true));
    layerCmdLog[layerName].push(cmdstr);
    lastLayerCmdElem.innerHTML = cmdstr;
    ShowLog(layerListElem.value);
}

function ShowLog(layerName: string) {
    const layerLog = layerCmdLog[layerName];
    const selectedLog = layerLog === undefined ? [] : layerLog.slice(-layerLogCountElem.value);
    layerLogElem.innerHTML = selectedLog.reduce((p, c) => `${p}<li>${c}</li>`, "");
}

export function LogVMCmd(cmd: KSLine, repl = false) {
    const vCmdCSS = {
        entry: "color:grey",
        func: "color:pink",
        text: "color:grey"
    };
    console.debug("%c%s", repl ? "color:red" : vCmdCSS[cmd.type], KSParser.stringify([cmd], !repl));
}

