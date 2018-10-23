export class ObjectMapper {
    constructor() {
        this.objs = []
        this.innerobj = null;
    }

    LoadObject(obj) {
        this.objs = this.objs.concat(Object.keys(obj.characters));
        this.objs = this.objs.concat(Object.keys(obj.stages));
        this.objs = this.objs.concat(Object.keys(obj.times));
        this.objs = this.objs.concat(Object.keys(obj.actions));
        this.innerobj = obj;
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

    // e.g:神様
    // return:
    // - name: 姫
    // - voicefile: kam%s_%03d.ogg
    GetNameInfo(txt) {
        var ret = {};
        var c = this.innerobj.characters[txt];
        if (c.nameAlias !== undefined) ret['name'] = c.nameAlias;
        else  ret['name'] = null;
        if (c.voiceFile !== undefined) ret['voicefile'] = c.voiceFile;
        else  ret['voicefile'] = null;

        return ret;

    }
}
