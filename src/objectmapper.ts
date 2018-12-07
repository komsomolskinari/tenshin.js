export default class ObjectMapper {
    static objs: string[] = []
    static name2type: {
        [name: string]: string
    } = {}
    static innerobj: any = null;
    // Object data cache
    static odatacache = {};


    static LoadObject(obj: any) {
        this.innerobj = obj;
        for (const i of ["times", "stages", "positions", "actions", "transitions", "characters", "emotions"]) {
            Object.keys(obj[i]).forEach(k => this.name2type[k] = i);
        }
        this.objs = Object.keys(this.name2type);
    }

    static AddLayer(layer: string) {
        this.name2type[layer] = 'layer'
    }

    static RemoveLayer(layer: string) {
        delete this.name2type[layer];
    }

    static GetProperty(str: string) {
        if (!this.IsProperty(str)) return undefined;
        let t = this.TypeOf(str);
        return this.innerobj[t][str];
    }

    static IsProperty(str: string) {
        return this.objs.includes(str);
    }

    static TypeOf(str: string) {
        return this.name2type[str];
    }

    static ConvertAll(option: any[]) {
        let mapped: {
            [key: string]: any
        } = {};
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