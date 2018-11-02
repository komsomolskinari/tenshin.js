// csv & tab-seprate txt parser

export class KRCSV {
    /**
     * Krirkiri specified CSV and tab table parser
     * @static
     * @param {String} txt Source string
     * @param {String} mode Seprator char
     * @param {*} title Title line, when null, no title
     */
    static Parse(txt, mode, title) {
        let lines = txt.split('\n').filter(l => l.length > 0);
        if (mode === undefined) mode = this.GuessMode(lines);
        if (mode != ',') lines = lines.map(l => l.replace(new RegExp(mode, 'g'), ','));
        if (lines.length == 0) return [];

        let body;
        // hack for krkr txt table
        if (title === undefined) {
            if (lines[0][0] == '#') lines[0] = lines[0].substr(1);
            body = lines.slice(1);
        }
        else body = lines;
        let titleline = this.ParseLine(lines[0]);



        let parsedLines = body.map(l => {
            // Parse line, and type convert
            let pl = this.ParseLine(l).map(u => {
                u = !isNaN(parseInt(u)) ? parseInt(u) : u;  // try int
                u = !isNaN(parseFloat(u)) ? parseFloat(u) : u;  // try float
                u = u ? u : null;   // check null
                return u;
            });

            // fill text index
            if (title) {
                for (let index = 0; index < pl.length; index++) {
                    pl[titleline[index]] = pl[index];
                }
            }
            return pl;
        });
        return parsedLines.filter(l => l.length > 0);
    }

    /**
     * Guess a line array is Tab-CSV or normal CSV
     * @param {[String]} lines Line array
     */
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