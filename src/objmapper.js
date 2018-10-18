export class ObjectMapper {
    constructor() {
        this.objs = []
    }

    LoadObject(obj) {
        this.objs = this.objs.concat(Object.keys(obj.characters));
        this.objs = this.objs.concat(Object.keys(obj.stages));
        this.objs = this.objs.concat(Object.keys(obj.times));
        this.objs = this.objs.concat(Object.keys(obj.actions));
    }
    HaveObject(obj) {
        return this.objs.includes(obj);
    }

    NewLay(cmd) {
        var name = cmd.param.name;
        this.objs.push(name);
    }

    DelLay(cmd) {
        var name = cmd.param.name;
        var idx = this.objs.indexOf(name);
        if (idx != -1) this.objs.splice(idx);
    }

    MapObject(obj) {

    }
}
