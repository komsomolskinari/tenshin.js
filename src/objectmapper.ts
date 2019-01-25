export default class ObjectMapper {
    static objs: string[] = [];
    static name2type: {
        [name: string]: string
    } = {};
    static innerobj: any = undefined;
    // Object data cache
    static odatacache = {};


    static LoadObject(object: any) {
        this.innerobj = object;
        for (const i of ["times", "stages", "positions", "actions", "transitions", "characters", "emotions"]) {
            Object.keys(object[i]).forEach(k => this.name2type[k] = i);
        }
        this.objs = Object.keys(this.name2type);
    }

    static AddLayer(layerName: string) {
        this.name2type[layerName] = "layer";
    }

    static RemoveLayer(layerName: string) {
        delete this.name2type[layerName];
    }

    static GetProperty(propName: string) {
        if (!this.IsProperty(propName)) return undefined;
        const t = this.TypeOf(propName);
        return this.innerobj[t][propName];
    }

    static IsProperty(propName: string) {
        return this.objs.includes(propName);
    }

    static TypeOf(name: string) {
        return this.name2type[name];
    }

    static ConvertAll(option: string[]) {
        const mapped: {
            [key: string]: any
        } = {};
        option.filter(o => this.IsProperty(o)).forEach(o => {
            const t = this.TypeOf(o);
            if (mapped[t] === undefined) mapped[t] = [];
            const mo = this.GetProperty(o);
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
