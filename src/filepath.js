export class FilePath {
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
            this.tree = await $.ajax(path)
            this.root = root.substr(root.length - 1) == '/' ? root : root + '/'
        }

        this.idxtree = this._genindex(this.tree);
        this.findtree = {};
        this._genfind(this.tree, '')
        this.loading = false;
        this.ready = true;
    }

    // only ls from /
    static ls(dir) {
        if (!this.ready) return undefined;
        if (dir === undefined) dir = '';
        var units = dir.split('/').filter(u => u)
        var p = this.idxtree;
        for (const u of units) {
            p = p[u]
        }
        return p;
    }

    static find(file) {
        if (!this.ready) return undefined;
        return this.findtree[file];
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
            if (e.type != "file") {
                this._genfind(e.sub, dir + '/' + e.name);
                return;
            }
            if (this.findtree[e.name] === undefined) {
                this.findtree[e.name] = []
            }
            this.findtree[e.name].push(dir + '/' + e.name)
        })
    }

    static async _loaddir(url) {
        var ls = await $.ajax(url);
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