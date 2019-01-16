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


export function HTMLEscape(str: string): string {
    const map: {
        [ch: string]: string
    } = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    };
    return str.replace(/[&<>"']/g, m => map[m]);
}
