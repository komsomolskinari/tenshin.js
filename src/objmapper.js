export class ObjectMapper {
    constructor() {
        // key name value type
        this.objs = []
        this.name2type = {}
        this.innerobj = null;
    }

    LoadObject(obj) {
        this.innerobj = obj;
        for (const i of ["times", "stages", "positions", "actions", "transitions", "characters", "emotions"]) {
            Object.keys(obj[i]).forEach(k => this.name2type[k] = i);
        }
        this.objs = Object.keys(this.name2type);
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

    MapObject(cmd) {
        // handle registered opions here
        // then pass name & image id to imageinfo
        console.log(cmd);
        var name = cmd.name;
        cmd.option.filter(o => this.objs.includes(o)).forEach(o => {
            console.log(o, this.name2type[o], this.innerobj[this.name2type[o]][o]);
        });
        console.log(cmd.option.filter(o => !this.objs.includes(o)))
    }

    // e.g:神様
    // return:
    // - name: 姫
    // - voicefile: kam%s_%03d.ogg
    GetNameInfo(txt) {
        var ret = {
            name: null,
            voicefile: null
        };
        if (txt == null) return ret;
        var c = this.innerobj.characters[txt];
        if (c.nameAlias !== undefined) ret['name'] = c.nameAlias;
        else ret['name'] = null;
        if (c.voiceFile !== undefined) ret['voicefile'] = c.voiceFile;
        else ret['voicefile'] = null;

        return ret;

    }
}
