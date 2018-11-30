/**
 * Auto convert data type
 * @param {*} str 
 */

export function AutoType(str) {
    let b = str + '';
    let orig = b;
    b = !isNaN(parseInt(b)) ? parseInt(b) : b;  // try int
    b = !isNaN(parseFloat(b)) ? parseFloat(b) : b;  // try float
    b = ((b + '') != orig) ? orig : b; // check for leading 0
    b = b ? b : null;   // check null
    // or keep string
    return b;
}

export function ParseHTML(str) {
    return new DOMParser()
        .parseFromString(str, "text/html")
        .firstChild     // <html>
        .lastChild      // <body>
}