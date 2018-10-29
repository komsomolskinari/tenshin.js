// csv & tab-seprate txt parser
/*
[
    ,
    {0:data0, 1:data1},
]
*/
export class KRCSV {
    static Parse(txt, mode) {
        let lines = txt.split('\n').filter(l => l.length > 0);
        if (mode === undefined) mode = this.GuessMode(lines);
        if (mode != ',') lines = lines.map(l => l.replace(new RegExp(mode, 'g'), ','));
        if (lines.length == 0) return [];

        // hack
        if (lines[0][0] == '#') lines[0] = lines[0].substr(1);
        const title = this.ParseLine(lines[0]);

        let parsedLines = lines.slice(1).map(l => {
            // Parse line, and type convert
            let pl = this.ParseLine(l).map(u => {
                u = parseInt(u) != NaN ? parseInt(u) : u;  // try int
                u = parseFloat(u) != NaN ? parseFloat(u) : u;  // try float
                u = u ? u : null;   // check null
                return u;
            });

            // fill text index
            for (let index = 0; index < pl.length; index++) {
                pl[title[index]] = pl[index];
            }
            return pl;
        });
        return parsedLines;
    }

    // csv or 'tsv'
    static GuessMode(lines) {
        if (lines.every(l => l.indexOf('\t') >= 0)) return '\t';
        else return ',';
    }

    // copy from https://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript-which-contains-comma-in-data
    // Return array of string values, or NULL if CSV string not well formed.
    static ParseLine(text) {
        var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
        var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
        // Return NULL if input string is not well formed CSV string.
        if (!re_valid.test(text)) return null;
        var a = [];                     // Initialize array to receive values.
        text.replace(re_value, // "Walk" the string using replace with callback.
            function (m0, m1, m2, m3) {
                // Remove backslash from \' in single quoted values.
                if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
                // Remove backslash from \" in double quoted values.
                else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
                else if (m3 !== undefined) a.push(m3);
                return ''; // Return empty string.
            });
        // Handle special case of empty last value.
        if (/,\s*$/.test(text)) a.push('');
        return a;
    };
}