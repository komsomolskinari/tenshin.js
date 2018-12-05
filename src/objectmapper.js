export default class ObjectMapper {
    static Init() {
        this.objs = []
        this.name2type = {}
        this.innerobj = null;
        // Object data cache
        this.odatacache = {};
    }

    static LoadObject(obj) {
        this.innerobj = obj;
        for (const i of ["times", "stages", "positions", "actions", "transitions", "characters", "emotions"]) {
            Object.keys(obj[i]).forEach(k => this.name2type[k] = i);
        }
        this.objs = Object.keys(this.name2type);
    }

    static AddLayer(layer) {
        this.name2type[layer] = 'layer'
    }

    static RemoveLayer(layer) {
        delete this.name2type[layer];
    }

    static GetProperty(str) {
        if (!this.IsProperty(str)) return undefined;
        let t = this.TypeOf(str);
        return this.innerobj[t][str];
    }

    static IsProperty(str) {
        return this.objs.includes(str);
    }

    static TypeOf(cmd) {
        if (!cmd) return null;
        if (!cmd.param) return this.name2type[cmd];
        return this.name2type[cmd.name];
    }

    static ConvertAll(option) {
        let mapped = {};
        option.filter(o => this.IsProperty(o)).forEach(o => {
            let t = this.TypeOf(o);
            if (mapped[t] === undefined) mapped[t] = [];
            let mo = this.GetProperty(o);
            if (mo.length === undefined) {
                mapped[t].push(mo);
            }
            else {
                for (const i of mo) {
                    mapped[t].push(i);
                }
            }
        });
        return mapped;
    }
}
ObjectMapper.Init();