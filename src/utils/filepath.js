export default class FilePath {
    /**
     * Load VFS
     */
    static async Load() {
        if (this.loading) return;
        this.loading = true;
        this.ready = false;
        this.mode = "nginx-json";
        this.root = "game/";        // game root
        this.loadpath = "game/";    // path file or game root
        this.loading = true;
        this.tree = [];

        this.root = this.root.substr(this.root.length - 1) == '/' ?
            this.root :
            this.root + '/';
        // directory browse driver
        // nginx json mode
        this.tree = await this.__loader(this.loadpath);
        // single file dirver
        // direct json mode
        // add tree driver?

        this.idxtree = this._genindex(this.tree);
        this.findtree = this._genfind(this.tree, '')
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

    /**
     * Find media file
     * @param {String} file file to find, without extension
     * @param {String} type file type
     * @param {Boolean} relative return path without root directory
     * @returns {String} path
     */
    static findMedia(file, type, relative) {
        let realname = this.mediatree[type][file.toLowerCase()];
        return this.find(realname, relative);
    }

    // ----- Generate index files ----- //
    /**
     * generate ls's index
     * @param {*} tree fs tree
     */
    static _genindex(tree) {
        let r = {}
        tree.forEach(e => {
            if (e.type == "directory") {
                r[e.name] = this._genindex(e.contents);
            }
            else r[e.name] = 0;
        });
        return r;
    }

    /**
     * generate findmedia's index
     * @param {[String]} findlist find tree in list format
     */
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
                console.debug(`FilePath: unknown file type, file: ${l}`);
                r.other[name] = l;
            }
        });
        return r;
    }

    /**
     * generate find's index
     * @param {*} tree fs tree
     * @param {String} dir start directory
     */
    static _genfind(tree, dir) {
        let ret = {};
        tree.forEach(e => {
            if (e.type == "file") {
                if (ret[e.name] === undefined)
                    ret[e.name] = [];
                ret[e.name].push(`${dir}/${e.name}`)
            }
            else {
                ret = Object.assign(ret, this._genfind(e.contents, `${dir}/${e.name}`));
            }
        })
        return ret;
    }

    // ----- Loader public tools ----- //
    /**
     * Load VFS directory
     * @param {*} url 
     */
    static async __loader(url) {
        /*
        [
            {
                name: string,
                type: "directory"/ "file",
                contents: [...]/ null
            }...
        ]
        */

        const __loader_http_map = {
            'nginx': this.__loader_nginx_html,
            'nginx-json': this.__loader_nginx_json,
            'nginx-xml': this.__loader_nginx_xml,
            'nginx-html': this.__loader_nginx_html,
            'hfs': this.__loader_hfs,
            'lighttpd': this.__loader_lighttpd,
            'apache': this.__loader_apache,
            'iis': this.__loader_iis,
        }


        // windows: tree /a /f
        // linux:   tree --charset ascii
        //          tree -J (ok)
        //          tree -X
        const __loader_file_map = {
            'json': this.__loader_tree_json,
            'xml': this.__loader__error,
            'tree': this.__loader__error,
        }

        if (!Object.keys(__loader_http_map).includes(this.mode)) {
            let text = await $.ajax(url, { dataType: 'text' });
            return __loader_file_map[this.mode](text);
        }

        // get raw data, so we can parse it next
        let ls = await $.ajax(url, { dataType: 'text' });
        let ret = [];
        let loader = __loader_http_map[this.mode] || this.__loader__error;
        ret = loader(ls);
        let ps = [];
        for (const l of ret) {
            if (l.type == "directory") {
                ps.push(
                    this.__loader(url + l.name + '/')
                        .then((arg) => l.contents = arg)
                );
            }
            else l["contents"] = null;
        }
        await Promise.all(ps)
        return ret;
    }

    // ----- Loader public tools ----- //
    static __loader__table(text) {
        return [].slice.call(
            new DOMParser()
                .parseFromString(text, "text/html")
                .getElementsByTagName('table')[0]
                .rows
        )
    }

    static __loader__pre(text) {
        return new DOMParser()
            .parseFromString(text, "text/html") // parse html
            .getElementsByTagName('pre')[0]     // get <pre>
            .innerHTML                          // 's innerhtml
            .split('\n')                        // as lines
            .filter(l => l)                     // and except empty line
    }

    static __loader__error() {
        console.error('FilePath: Invaild file listing mode');
    }

    // ----- Loader for each httpd ----- //
    static __loader_nginx_json(text) {
        return JSON.parse(text);
    }
    static __loader_nginx_xml(text) {
        let ret = [];
        let ngxml = $.parseXML(text);
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
        return ret;
    }
    static __loader_nginx_html(text) {
        let ret = [];
        this.__loader__pre(text).forEach(l => {
            let filename = $(l).text();
            if (filename[0] == '.') return;
            let match = filename.match(/(.+)\/$/i);
            if (match) {
                ret.push({
                    name: match[1],
                    type: 'directory'
                });
            }
            else {
                ret.push({
                    name: filename,
                    type: 'file'
                });
            }
        });
        return ret;
    }
    static __loader_hfs(text) {
        let ret = [];
        this.__loader__table(text)
            .slice(1)
            .forEach(r => {
                let filename = r        // tr
                    .cells[0]           // 1st td
                    .firstElementChild  // input
                    .value;             // .value
                if (filename[0] == '.') return;
                let match = filename.match(/(.+)\/$/i);
                if (match) {
                    ret.push({
                        name: match[1],
                        type: 'directory'
                    });
                }
                else {
                    ret.push({
                        name: filename,
                        type: 'file'
                    });
                }
            });
        return ret;
    }
    static __loader_lighttpd(text) {
        let ret = [];
        this.__loader__table(text)
            .slice(1)
            .forEach(r => {
                let type = [].includes.call(r.classList, 'd') ?
                    'directory' :
                    'file';
                let name = r            // tr
                    .cells[0]           // 1st td
                    .firstElementChild  // a
                    .innerText;         // text
                if (name[0] == '.') return;
                ret.push({ name, type });
            });
        return ret;
    }
    static __loader_iis(text) {
        let ret = [];
        this.__loader__pre(text).forEach(l => {
            let a = $(l);
            let name = a.text();
            let type = a.attr('href').match(/\/$/) ?
                'directory' :
                'file';
            if (name[0] == '.') return;
            ret.push({ name, type });
        });
        return ret;
    }
    static __loader_apache(text) {
        let ret = [];
        this.__loader__table(text)
            .slice(1)
            .forEach(r => {
                let filename = r        // tr
                    .cells[1]           // 2nd td, 1st is icon
                    .firstElementChild  // a
                    .href;              // .href
                if (filename[0] == '.') return;
                let match = filename.match(/(.+)\/$/i);
                if (match) {
                    ret.push({
                        name: match[1],
                        type: 'directory'
                    });
                }
                else {
                    ret.push({
                        name: filename,
                        type: 'file'
                    });
                }
            });
        return ret;
    }

    static __loader_tree_json(text) {
        let obj = JSON.parse(text);
        return obj[0].contents;
    }
}
window.FilePath = FilePath