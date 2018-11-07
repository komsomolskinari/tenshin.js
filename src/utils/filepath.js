export default class FilePath {
    /**
     * Load filesystem 
     * Only JSON mode works
     */
    static async Load() {
        if (this.loading) return;
        this.loading = true;
        this.ready = false;
        var mode = "json"
        var path = "tree.json"
        var root = "game"
        this.loading = true;
        this.tree = [];
        // nginx json mode
        if (mode == "nginx") {
            this.tree = await this._loaddir(path)
            this.root = path;
        }
        // direct json mode
        else if (mode == "json") {
            this.tree = await $.getJSON(path)
            this.root = root.substr(root.length - 1) == '/' ? root : root + '/'
        }

        this.idxtree = this._genindex(this.tree);
        this.findtree = {};
        this._genfind(this.tree, '')
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
        var units = dir.split('/').filter(u => u);
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
        return (this.root + '/' + this.findtree[file][0]).replace(/\/+/g, '/');
    }

    static _genindex(tree) {
        var r = {}
        tree.forEach(e => {
            if (e.type == "directory") {
                r[e.name] = this._genindex(e.sub);
            }
            else r[e.name] = 0;
        });
        return r;
    }

    // '' -> 'voice' -> 'voice/aoi'
    static _genfind(tree, dir) {
        tree.forEach(e => {
            if (e.type == "file") {
                if (this.findtree[e.name] === undefined)
                    this.findtree[e.name] = [];
                this.findtree[e.name].push(dir + '/' + e.name)
            }
            else {
                this._genfind(e.sub, dir + '/' + e.name);
            }
        })
    }

    static async _loaddir(url) {
        var ls = await $.getJSON(url);
        var ps = [];
        for (const l of ls) {
            if (l.type == "directory") {
                ps.push(loaddir(url + l.name + '/').then((arg) => l.sub = arg));
            }
            else l["sub"] = null;
        }
        Promise.all(ps)
        return ls;
    }
}
//window.FilePath = FilePath