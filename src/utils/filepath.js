export default class FilePath {
    /**
     * Load filesystem 
     * Only JSON mode works
     */
    static async Load() {
        if (this.loading) return;
        this.loading = true;
        this.ready = false;
        this.mode = "lighttpd";
        this.path = "tree.json";
        this.root = "game/";
        this.loading = true;
        this.tree = [];
        // directory browse driver
        // nginx json mode
        if (this.mode !== "json") {
            this.tree = await this._loaddir(this.root)
            this.path = this.root;
        }
        // single file dirver
        // direct json mode
        else {
            this.tree = await $.getJSON(this.path)
            this.root = this.root.substr(this.root.length - 1) == '/' ?
                this.root :
                this.root + '/';
        }

        this.idxtree = this._genindex(this.tree);
        this.findtree = {};
        this._genfind(this.tree, '')
        this.mediatree = this._genmedia(Object.keys(this.findtree));
        this.loading = false;
        this.ready = true;
    }

    /**
     * List directory
     * @param {String} dir String, target directory
     * @returns {*} FileTree, undefine if dir not exist
     */
    static ls(dir) {
        if (!this.ready) return undefined;
        if (dir === undefined) dir = '';
        let units = dir.split('/').filter(u => u);
        return units.reduce((prev, curr) => prev === undefined ? undefined : prev[curr], this.idxtree);
    }

    /**
     * Find file
     * @param {String} file file to find, with extension
     * @param {Boolean} relative return path without root directory
     * @returns {String} path
     */
    static find(file, relative) {
        if (!this.ready) return undefined;
        if (relative === true) return this.findtree[file];
        let treeItem = (this.findtree[file] || [])[0];
        if (treeItem) return (`${this.root}/${treeItem}`).replace(/\/+/g, '/');
        else return undefined;
    }

    static findMedia(file, type, relative) {
        let realname = this.mediatree[type][file.toLowerCase()];
        return this.find(realname, relative);
    }

    static _genindex(tree) {
        let r = {}
        tree.forEach(e => {
            if (e.type == "directory") {
                r[e.name] = this._genindex(e.sub);
            }
            else r[e.name] = 0;
        });
        return r;
    }

    static _genmedia(findlist) {
        let r = {
            image: {},
            video: {},
            audio: {},
            script: {},
            other: {},
        }

        // See: https://developer.akamai.com/legacy/learn/Images/common-image-formats.html
        // See: http://www.chromium.org/audio-video
        // Script: txt csv ini - standard format,
        //         ks tjs - krkr engine
        //         asd func sli - krkr data
        // Unsupported format needs convert.
        const imageExt = ["bmp", "jpg", "jpeg", "png", "webp", "gif", "svg"];
        const videoExt = ["mp4", "webm", "m4a", "ogv", "ogm"];
        const audioExt = ["mp3", "flac", "ogg", "oga", "opus", "wav"];
        const scriptExt = ["txt", "csv", "ks", "tjs", "func", "ini", "asd", "sli"];

        findlist.forEach(l => {
            let [, name, ext] = l.toLowerCase().match(/(.+?)\.([^.]*$|$)/i);
            if (imageExt.includes(ext)) {
                r.image[name] = l;
            }
            else if (videoExt.includes(ext)) {
                r.video[name] = l;
            }
            else if (audioExt.includes(ext)) {
                r.audio[name] = l;
            }
            else if (scriptExt.includes(ext)) {
                r.script[name] = l;
            }
            else {
                r.other[name] = l;
            }
        });
        return r;
    }

    // '' -> 'voice' -> 'voice/aoi'
    static _genfind(tree, dir) {
        tree.forEach(e => {
            if (e.type == "file") {
                if (this.findtree[e.name] === undefined)
                    this.findtree[e.name] = [];
                this.findtree[e.name].push(`${dir}/${e.name}`)
            }
            else {
                this._genfind(e.sub, `${dir}/${e.name}`);
            }
        })
    }


    /**
     * Load VFS directory
     * @param {*} url 
     */
    static async _loaddir(url) {
        /*
        [
            {
                name: string,
                type: "directory"/ "file",
                sub: [...]/ null
            }...
        ]
        */
        // get raw data, so we can parse it next
        let ls = await $.ajax(url, { dataType: 'text' });
        let ret = [];
        switch (this.mode) {
            case 'nginx-json': // nginx json, all other format will convert to it
                ret = JSON.parse(ls);
                break;
            case 'nginx-xml': // nginx xml
                let ngxml = $.parseXML(ls);
                $(ngxml).find('directory').each((idx, elm) => {
                    ret.push({
                        name: $(elm).text(),
                        type: 'directory'
                    })
                });
                $(ngxml).find('file').each((idx, elm) => {
                    ret.push({
                        name: $(elm).text(),
                        type: 'file'
                    })
                });
                break;
            case 'nginx-html':
                new DOMParser()
                    .parseFromString(ls, "text/html")   // parse html
                    .getElementsByTagName('pre')[0]     // get <pre>
                    .innerHTML                          // 's innerhtml
                    .split('\n')                        // as lines
                    .filter(l => l)                     // and except empty line
                    .forEach(l => {
                        let filename = $(l).text();
                        if (filename[0] == '.') return;
                        let match = filename.match(/(.+)\/$/i)
                        if (match) {
                            ret.push({
                                name: match[1],
                                type: 'directory'
                            })
                        }
                        else {
                            ret.push({
                                name: filename,
                                type: 'file'
                            })
                        }
                    })
                break;
            case 'hfs': // broken
                let hfsrows = new DOMParser()
                    .parseFromString(ls, "text/html")
                    .getElementById('files')            // get #file
                    .rows;                              // 's rows

                [].slice.call(hfsrows, 1)               // except header line
                    .forEach(r => {
                        let filename = r                // tr
                            .cells[0]                   // 1st td
                            .firstElementChild          // input
                            .value;                     // .value
                        if (filename[0] == '.') return;
                        let match = filename.match(/(.+)\/$/i)
                        if (match) {
                            ret.push({
                                name: match[1],
                                type: 'directory'
                            })
                        }
                        else {
                            ret.push({
                                name: filename,
                                type: 'file'
                            })
                        }
                    })
                break;
            case 'lighttpd':
                let lhdrows = new DOMParser()
                    .parseFromString(ls, "text/html")
                    .getElementsByTagName('table')[0]   // get 1st table
                    .rows;                              // 's rows

                [].slice.call(lhdrows, 1)               // except header line
                    .forEach(r => {
                        let type = [].includes.call(r.classList, 'd') ?
                            'directory' :
                            'file';
                        let name = r                    // tr
                            .cells[0]                   // 1st td
                            .firstElementChild          // a
                            .innerText                  // text
                            //.match(/(.+)\/?$/i)[1]      // remove optional /
                        if (name[0] == '.') return;
                        ret.push({ name, type });
                    })
                break;
        }
        let ps = [];
        for (const l of ret) {
            if (l.type == "directory") {
                ps.push(this._loaddir(url + l.name + '/').then((arg) => l.sub = arg));
            }
            else l["sub"] = null;
        }
        await Promise.all(ps)
        return ret;
    }
}
window.FilePath = FilePath