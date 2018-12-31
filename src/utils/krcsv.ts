// csv & tab-seprate txt parser
// TODO: How about https://github.com/adaltas/node-csv-parse
import { AutoType } from "./util";

export default class KRCSV {
    /**
     * Krirkiri specified CSV and tab table parser
     * @static
     * @param txt Source string
     * @param mode Seprator char
     * @param title Title line, when null, no title
     */
    static parse(txt: string, mode: string, title?: string[] | null | boolean) {
        let lines = txt.split("\n").filter(l => l.length > 0);
        if (mode === undefined) mode = this.GuessMode(lines);
        if (mode !== ",") lines = lines.map(l => l.replace(new RegExp(mode, "g"), ","));
        if (lines.length === 0) return [];

        let body;
        // hack for krkr txt table
        if (title === undefined) {
            if (lines[0][0] === "#") lines[0] = lines[0].substr(1);
            body = lines.slice(1);
        }
        else body = lines;
        const titleline = this.ParseLine(lines[0]);

        const parsedLines = body.map(l => {
            // Parse line, and type convert
            const pl: any = this.ParseLine(l).map(u => AutoType(u));

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
     * @param lines Line array
     */
    private static GuessMode(lines: string[]): string {
        if (lines.every(l => l.indexOf("\t") >= 0)) return "\t";
        else return ",";
    }

    // copy from https://stackoverflow.com/questions/8493195/how-can-i-parse-a-csv-string-with-javascript-which-contains-comma-in-data
    // Return array of string values, or undefined if CSV string not well formed.
    // Modified to TS format
    private static ParseLine(text: string) {
        const reValid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
        const reValue = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
        // Return NULL if input string is not well formed CSV string.
        if (!reValid.test(text)) return undefined;
        const a = [];                     // Initialize array to receive values.
        text.replace(reValue, // "Walk" the string using replace with callback.
            (m0, m1, m2, m3) => {
                // Remove backslash from \' in single quoted values.
                if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
                // Remove backslash from \" in double quoted values.
                else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
                else if (m3 !== undefined) a.push(m3);
                return ""; // Return empty string.
            });
        // Handle special case of empty last value.
        if (/,\s*$/.test(text)) a.push("");
        return a;
    }
}
