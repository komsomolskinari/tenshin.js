import TJSON from "./tjson";

/**
 * Auto convert data type
 * @param str
 */
const div = document.createElement("div");
export function AutoType(str: string): string | number {
    let b: any = str + "";
    const orig = b;
    b = !isNaN(parseInt(b)) ? parseInt(b) : b;  // try int
    b = !isNaN(parseFloat(b)) ? parseFloat(b) : b;  // try float
    b = ((b + "") !== orig) ? orig : b; // check for leading 0
    b = b ? b : undefined;   // check null
    // or keep string
    return b;
}

export function ParseHTML(str: string): HTMLElement {
    return new DOMParser()
        .parseFromString(str, "text/html")
        .body;
}

export function ParseXML(str: string): Element {
    return new DOMParser()
        .parseFromString(str, "text/xml")
        .children[0];
}

export async function AJAX(url: string): Promise<string> {
    const xhr = new XMLHttpRequest();
    let resolve: (val?: string) => void;
    let reject: (val?: any) => void;
    const pm = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    if (!xhr) reject(new Error("No AJAX support"));
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            (xhr.status === 200) ? resolve(xhr.responseText) : reject("AJAX fail");
        }
    };
    xhr.open("GET", url);
    xhr.send();
    return pm as Promise<string>;
}