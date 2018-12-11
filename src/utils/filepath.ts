enum ItemType { file = "file", directory = "directory" }
interface DirItem {
    name: string;
    type: ItemType;
    contents?: DirItem[];
}

interface FindIndex {
    [name: string]: string[];
}

interface MediaIndex {
    [type: string]: { [name: string]: string };
}

export default class FilePath {
    static loading = false;

    static ready = false;
    static mode: ConfigTreeMode = Config.File.TreeMode;
    static root: string = Config.File.Root;           // game root
    static loadpath: string = Config.File.TreePath;   // path file or game root
    static tree: DirItem[] = [];
    static idxtree: IndexItem;
    static findtree: FindIndex;
    static mediatree: MediaIndex;
    /**
     * Load VFS
     */
    static async Load() {
        if (this.loading) return;
        this.loading = true;
        this.tree = [];
        this.root = this.root.substr(this.root.length - 1) === "/" ?
            this.root :
            this.root + "/";
        // directory browse driver
        // nginx json mode
        this.tree = await this.__loader(this.loadpath);
        // single file dirver
        // direct json mode
        // add tree driver?

        this.idxtree = this._genindex(this.tree);
        this.findtree = this._genfind(this.tree, "");
        this.mediatree = this._genmedia(Object.keys(this.findtree));

        this.loading = false;
        this.ready = true;
    }

    /**
     * List directory
     * @param dir String, target directory
     * @returns FileTree, undefine if dir not exist
     */
    static ls(dir: string) {
        if (!this.ready) return undefined;
        if (dir === undefined) dir = "";
        const units = dir.split("/").filter(u => u);
        return units.reduce((prev, curr) => prev === undefined ? undefined : prev[curr], this.idxtree);
    }

    /**
     * Find file
     * @param file file to find, with extension
     * @param relative return path without root directory
     * @returns path
     */
    static find(file: string, relative?: boolean): string {
        if (!this.ready) return undefined;
        if (relative === true) return this.findtree[file][0];
        const treeItem = (this.findtree[file] || [])[0];
        if (treeItem) return (`${this.root}/${treeItem}`).replace(/\/+/g, "/");
        else return undefined;
    }

    /**
     * Find media file
     * @param file file to find, without extension
     * @param type file type
     * @param relative return path without root directory
     */
    static findMedia(file: string, type: string, relative?: boolean): string {
        const realname = this.mediatree[type][file.toLowerCase()];
        return this.find(realname, relative);
    }
    /**
     * Perform async read
     * @param  file file to find, with/without extension
     * @param  type file type, if undefined, file is with ext
     */
    static async read(file: string, type?: string) {
        const path = type ? this.findMedia(file, type) : this.find(file);
        return $.get(path);
    }

    // ----- Generate index files ----- //
    /**
     * generate ls's index
     * @param tree fs tree
     */
    static _genindex(tree: DirItem[]): IndexItem {
        const ret: IndexItem = {};
        tree.forEach((item: DirItem) => {
            if (item.type === ItemType.directory) {
                ret[item.name] = this._genindex(item.contents);
            }
            else ret[item.name] = undefined;
        });
        return ret;
    }

    /**
     * generate findmedia's index
     * @param findlist find tree in list format
     */
    static _genmedia(findlist: string[]) {
        const ret: {
            image: { [key: string]: string },
            video: { [key: string]: string },
            audio: { [key: string]: string },
            script: { [key: string]: string },
            other: { [key: string]: string },
        } = {
            image: {},
            video: {},
            audio: {},
            script: {},
            other: {},
        };

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
            const [, name, ext] = l.toLowerCase().match(/(.+?)\.([^.]*$|$)/i);
            if (imageExt.includes(ext)) {
                ret.image[name] = l;
            }
            else if (videoExt.includes(ext)) {
                ret.video[name] = l;
            }
            else if (audioExt.includes(ext)) {
                ret.audio[name] = l;
            }
            else if (scriptExt.includes(ext)) {
                ret.script[name] = l;
            }
            else {
                console.debug(`FilePath: unknown file type, file: ${l}`);
                ret.other[name] = l;
            }
        });
        return ret;
    }

    /**
     * generate find's index
     * @param tree fs tree
     * @param dir start directory
     */
    static _genfind(tree: DirItem[], dir: string): FindIndex {
        let ret: FindIndex = {};
        tree.forEach((e: DirItem) => {
            if (e.type === ItemType.file) {
                if (ret[e.name] === undefined) {
                    ret[e.name] = [];
                }
                ret[e.name].push(`${dir}/${e.name}`);
            }
            else {
                ret = { ...ret, ...this._genfind(e.contents, `${dir}/${e.name}`) };
            }
        });
        return ret;
    }

    // ----- Loader public tools ----- //
    /**
     * Load VFS directory
     * @param url
     */
    static async __loader(url: string) {
        const loaderHttpMap: {
            [mode: string]: (str: string) => DirItem[]
        } = {
            "nginx": this.__loader_nginx_html,
            "nginx-json": this.__loader_nginx_json,
            "nginx-xml": this.__loader_nginx_xml,
            "nginx-html": this.__loader_nginx_html,
            "hfs": this.__loader_hfs,
            "lighttpd": this.__loader_lighttpd,
            "apache": this.__loader_apache,
            "iis": this.__loader_iis,
        };


        // windows: tree /a /f
        // linux:   tree --charset ascii
        //          tree -J (ok)
        //          tree -X
        const loaderFileMap: { [prop: string]: (str: string) => DirItem[] } = {
            json: this.__loader_tree_json,
            // 'xml': this.__loader__error,
            // 'tree': this.__loader__error,
        };

        if (!Object.keys(loaderHttpMap).includes(String(this.mode))) {
            const text = await $.ajax(url, { dataType: "text" });
            return loaderFileMap[this.mode](text);
        }

        // get raw data, so we can parse it next
        const ls: string = await $.ajax(url, { dataType: "text" });
        let ret: DirItem[] = [];
        const loader = loaderHttpMap[this.mode] || this.__loader__error;
        ret = loader.call(this, ls);    // need rewrite 'this'
        const idx: {
            [name: string]: number
        } = {};
        ret.forEach((item, id) => idx[item.name] = id);
        await Promise.all(ret
            .filter(item => item.type === ItemType.directory)
            .map(item =>
                (
                    async () => {
                        ret[idx[item.name]].contents = await this.__loader(url + item.name + "/");
                    }
                )()
            ));
        return ret;
    }

    static __loader__table(text: string) {
        return [].slice.call(// return raw array
            new DOMParser()
                .parseFromString(text, "text/html")
                .getElementsByTagName("table")[0]
                .rows
        );
    }

    static __loader__pre(text: string) {
        return new DOMParser()
            .parseFromString(text, "text/html")
            .getElementsByTagName("pre")[0]     // get <pre>
            .innerHTML                          // 's innerhtml
            .split(/\n|<br>|<br \/>| <br\/>/g)  // as lines
            .filter(l => l);                     // and except empty line
    }

    static __loader__error() {
        console.error("FilePath: Invaild file listing mode");
    }

    // ----- Loader for each httpd ----- //
    // NOTE: If anyone wants add a new loader, please DO NOT use URL parser
    //          it will mess encoding up
    static __loader_nginx_json(text: string) {
        return JSON.parse(text);
    }
    static __loader_nginx_xml(text: string) {
        const ret: DirItem[] = [];
        const ngxml = $.parseXML(text);
        $(ngxml).find("directory").each((idx, elm) => {
            ret.push({
                name: $(elm).text(),
                type: ItemType.directory
            });
        });
        $(ngxml).find("file").each((idx, elm) => {
            ret.push({
                name: $(elm).text(),
                type: ItemType.file
            });
        });
        return ret;
    }
    static __loader_nginx_html(text: string) {
        console.log("nginx html autoindex will truncate long file name");
        const ret: DirItem[] = [];
        this.__loader__pre(text).forEach(l => {
            const filename = $(l).text();
            if (filename[0] === ".") return;
            const match = filename.match(/(.+)\/$/i);
            if (match) {
                ret.push({
                    name: match[1],
                    type: ItemType.directory
                });
            }
            else {
                ret.push({
                    name: filename,
                    type: ItemType.file
                });
            }
        });
        return ret;
    }
    static __loader_hfs(text: string) {
        console.log("HFS is known have perfomance issue");
        const ret: DirItem[] = [];
        this.__loader__table(text)
            .slice(1)
            .forEach((r: HTMLTableRowElement) => {
                const filename = (r       // tr
                    .cells[0]           // 1st td
                    .firstElementChild as HTMLInputElement)
                    .value;             // .value
                if (filename[0] === ".") return;
                const match = filename.match(/(.+)\/$/i);
                if (match) {
                    ret.push({
                        name: match[1],
                        type: ItemType.directory
                    });
                }
                else {
                    ret.push({
                        name: filename,
                        type: ItemType.file
                    });
                }
            });
        return ret;
    }
    static __loader_lighttpd(text: string) {
        const ret: DirItem[] = [];
        this.__loader__table(text)
            .slice(1)
            .forEach((r: HTMLTableRowElement) => {
                const type = [].includes.call(r.classList, "d") ?
                    ItemType.directory :
                    ItemType.file;
                const name = (r   // tr
                    .cells[0]   // 1st td
                    .firstElementChild as HTMLAnchorElement)
                    .innerText; // text
                if (name[0] === ".") return;
                ret.push({ name, type });
            });
        return ret;
    }
    static __loader_iis(text: string) {
        const ret: DirItem[] = [];
        this.__loader__pre(text).forEach((l, i) => {
            if (i === 0) return; // jump first line
            const a = new DOMParser()
                .parseFromString(l, "text/html")
                .getElementsByTagName("a")[0];
            const name = a.innerText;
            const type = a.href.match(/\/$/) ?
                ItemType.directory :
                ItemType.file;
            ret.push({ name, type });
        });
        return ret;
    }
    static __loader_apache(text: string) {
        const ret: DirItem[] = [];
        this.__loader__table(text)
            .slice(3)      // 1: title 2: span 3: parent
            .forEach((r: HTMLTableRowElement) => {
                const td = r       // tr
                    .cells[1];   // 2nd td, 1st is icon
                if (!td) return;
                const filename = td
                    .firstElementChild  // a
                    .innerHTML;

                const match = filename.match(/(.+)\/$/i);
                if (match) {
                    ret.push({
                        name: match[1],
                        type: ItemType.directory
                    });
                }
                else {
                    ret.push({
                        name: filename,
                        type: ItemType.file
                    });
                }
            });
        return ret;
    }

    static __loader_tree_json(text: string) {
        const obj = JSON.parse(text);
        return obj[0].contents;
    }
}
