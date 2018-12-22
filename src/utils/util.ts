/**
 * Auto convert data type from string
 * @param str
 */
export function AutoType(str: string): string | number {
    const rStr: string = str + "";
    // try int
    const rInt = parseInt(rStr);
    if (!isNaN(rInt)) {
        if ((rInt + "") === str) return rInt;
    }
    // try float
    if (!isNaN(parseFloat(rStr))) return parseFloat(rStr);
    if (rStr === "") return undefined;
    // or keep string
    return rStr;
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