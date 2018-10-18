import { TJSON } from "./tjson";
import { KSParser } from "./ksparser";
import { KSVM } from "./ksvm";
import { Runtime } from "./runtime";
import { ObjectMapper } from './objmapper';

var scenes = [];
var RT = new Runtime();
var VM = new KSVM(RT);
var Mapper = new ObjectMapper();
RT.mapper = Mapper;
RT.TJShack =
    {
        "f.all_clear_check=(sf.sakuya_clear && sf.ruri_clear && sf.sana_clear && sf.aoi_clear && sf.mahiro_clear && sf.yukari_clear)": 1,
        "!(f.sak_flag == 5 || f.all_clear_check)": true,
        "!kag.isRecollection": true
    };
RT.TJSvar["f.all_clear_check"] = true;
RT.TJSvar["f.sak_flag"] = 0;
RT.TJSvar["f.san_flag"] = 0;
RT.TJSvar["f.aoi_flag"] = 0;
RT.TJSvar["f.mah_flag"] = 0;
RT.TJSvar["f.rur_flag"] = 0;
RT.TJSvar["f.yuk_flag"] = 0;

window.RT = RT;
window.VM = VM;
window.Mapper = Mapper;

$(document).ready(() => {
    $.get("game/main/envinit.tjs", (d, s, x) => {
        var o = TJSON.Parse(d);
        Mapper.LoadObject(o);
    });
    $.get("game/scenario/", (d, s, x) => {
        for (const key in d) {
            if (d.hasOwnProperty(key)) {
                const elm = d[key];
                if (elm.type == "file") {
                    scenes.push(elm.name.split('.')[0]);
                }
            }
        }

        var tasks = 0;
        for (const s of scenes) {
            tasks++;
            $.get("game/scenario/" + s + ".ks", (d, st, x) => {
                var spt = KSParser.Parse(d);
                VM.AddScript(s, spt);
                tasks--;
                if (tasks == 0) {
                    $(document).on('click', () => VM.Next());
                    VM.RunFrom('start');

                }
            });
        }
    });
});