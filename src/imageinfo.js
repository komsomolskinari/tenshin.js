import { FilePath } from "./filepath";
import { KRCSV } from './krcsv';
// image info loader

export class ImageInfo {
    constructor(basedir) {
        const ls = FilePath.ls(basedir);
        this.files = [];
        this.data = {};
        Object.keys(ls).forEach(key => {
            let subdir = ls[key];
            Object.keys(subdir).forEach(name => {
                if (name.match(/\.txt$/g)) {
                    this.files.push(name);
                }
            })
        });
        // load info file
        this.files.filter(f => f.match(/info/g)).forEach(f => this.LoadFile(f));
    }

    async LoadFile(file) {
        // 朋花_私服夏_ポーズa_info.txt
        // char_packprefix_info.txt (chunk info)
        // 朋花_私服夏_ポーズa_3.txt
        // char_packprefix_variant.txt (coord data)
        // 朋花_私服夏_ポーズa_3_373.png
        // char_packprefix_variant_id.png (real image)
        let fdata = KRCSV.Parse(await $.get(FilePath.find(file)), '\t', false)

        const charname = file.split('_')[0];
        // load chunk data
        if (this.data[charname] === undefined)
            this.data[charname] = {
                dress: {},
                face: {}
            };
        fdata.filter(l => l.length == 5).forEach(l => {
            if (this.data[charname].dress[l[1]] === undefined) this.data[charname].dress[l[1]] = {};
            this.data[charname].dress[l[1]][l[3]] = l[4];
        })
        fdata.filter(l => l.length == 4).forEach(l => {
            this.data[charname].face[l[1]] = l[3];
        })
    }
}