import { ImageInfo } from "./imageinfo";

export class ObjectMapper {
    constructor() {
        // key name value type
        this.objs = []
        this.name2type = {}
        this.innerobj = null;
        this.ImageInfo = null;
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
        let objdata = {}
        // handle registered opions here
        // then pass name & image id to imageinfo
        cmd.option.filter(o => this.objs.includes(o)).forEach(o => {
            if (objdata[this.name2type[o]] === undefined) objdata[this.name2type[o]] = [];
            let mo = this.innerobj[this.name2type[o]][o];
            if (mo.length === undefined) {
                objdata[this.name2type[o]].push(mo);
            }
            else {
                for (const i of mo) {
                    objdata[this.name2type[o]].push(i);
                }
            }
        });
        cmd.objdata = objdata;
        let newcmd = JSON.parse(JSON.stringify(cmd));
        newcmd.option = cmd.option
            .filter(o => !this.objs.includes(o))
            .filter(o => !["sync", "nosync", "back", "front", "grayscale", "bvoice", "nextvoice", "resetcolor", "stopvoice", "hideemotion"].includes(o));
        newcmd.param = {}

        if (this.name2type[cmd.name] == "characters") {
            newcmd.name = this.GetNameInfo(cmd.name).standname;
            let img = this.ImageInfo.GetImageInfo(newcmd);
        }
    }

    // e.g:神様
    // return:
    // - name: 姫
    // - voicefile: kam%s_%03d.ogg
    // - standname:
    GetNameInfo(name) {
        var ret = {
            name: null,
            voicefile: null,
            standname: null
        };
        if (name == null) return ret;
        var c = this.innerobj.characters[name];
        if (c.nameAlias !== undefined) ret.name = c.nameAlias;
        if (c.voiceFile !== undefined) ret.voicefile = c.voiceFile;
        if (c.standName !== undefined) ret.standname = c.standName;
        else ret.standname = name;
        return ret;

    }
}
