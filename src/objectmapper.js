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

    static NewLay(cmd) {
        var name = cmd.param.name;
        this.objs.push(name);
    }

    static DelLay(cmd) {
        var name = cmd.param.name;
        var idx = this.objs.indexOf(name);
        if (idx != -1) this.objs.splice(idx);
    }

    static IsProperty(str) {
        return this.objs.includes(str);
    }

    static TypeOf(cmd) {
        if (!cmd.param) return this.name2type[cmd];
        return this.name2type[cmd.name];
    }

    // e.g:神様
    // return:
    // - name: 姫
    // - voicefile: kam%s_%03d.ogg
    // - standname:
    static GetNameInfo(name) {
        let ret = {
            name: null,
            voicefile: null,
            standname: null
        };
        if (name == null) return ret;
        let c = this.innerobj.characters[name];
        if (c.nameAlias !== undefined) ret.name = c.nameAlias;
        if (c.voiceFile !== undefined) ret.voicefile = c.voiceFile;
        if (c.standName !== undefined) ret.standname = c.standName;
        else ret.standname = name;
        return ret;

    }
}
ObjectMapper.Init();