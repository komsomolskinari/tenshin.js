export default class FilePath {
    /**
     * Load filesystem 
     * Only JSON mode works
     */
    static async Load() {
        if (this.loading) return;
        this.loading = true;
        this.ready = false;
        this.mode = "nginx";
        this.path = "tree.json";
        this.root = "game/";
        this.loading = true;
        this.tree = [];
        // nginx json mode
        if (this.mode == "nginx") {
            this.tree = await this._loaddir(this.root)
            this.path = this.root;
        }
        // direct json mode
        else if (this.mode == "json") {
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
            let [, name, ext] = l.match(/(.+?)\.([^.]*$|$)/i);
            ext = ext.toLowerCase();
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

    static async _loaddir(url) {
        let ls = await $.getJSON(url);
        let ps = [];
        for (const l of ls) {
            if (l.type == "directory") {
                ps.push(this._loaddir(url + l.name + '/').then((arg) => l.sub = arg));
            }
            else l["sub"] = null;
        }
        await Promise.all(ps)
        return ls;
    }
}
window.FilePath = FilePath