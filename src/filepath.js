export class FilePath {
    static loading = false;
    static ready = false;
    static async Load() {
        var mode = "json"
        var path = "tree.json"
        this.loading = true;
        this.tree = [];
        // nginx json mode
        if (mode == "nginx") {
            this.tree = await this._loaddir(path)
        }
        // direct json mode
        else if (mode == "json") {
            this.tree = await $.ajax(path)
        }
        this.loading = false
        this.ready = true;
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