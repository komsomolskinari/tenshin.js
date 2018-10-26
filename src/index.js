import { TJSON } from "./tjson";
import { KSParser } from "./ksparser";
import { KSVM } from "./ksvm";
import { Runtime } from "./runtime";
import { ObjectMapper } from './objmapper';
import { FilePath } from './filepath';

var scenes = [];
var RT = new Runtime();
var VM = new KSVM(RT);
var Mapper = new ObjectMapper();
RT.mapper = Mapper;
RT.TJShack = {
    "f.all_clear_check=(sf.sakuya_clear && sf.ruri_clear && sf.sana_clear && sf.aoi_clear && sf.mahiro_clear && sf.yukari_clear)": 1,
    "!(f.sak_flag == 5 || f.all_clear_check)": true,
    "!kag.isRecollection": true
};
RT.TJSvar = {
    "f.all_clear_check": true,
    "f.sak_flag": 0,
    "f.san_flag": 0,
    "f.aoi_flag": 0,
    "f.mah_flag": 0,
    "f.rur_flag": 0,
    "f.yuk_flag": 0,
};


window.RT = RT;
window.VM = VM;
window.Mapper = Mapper;
window.FilePath = FilePath;

async function LoadVMData() {
    var ScriptLoadSeq = ['start.ks', '１.ks', '２.ks']
    await FilePath.Load();
    Mapper.LoadObject(TJSON.Parse(await $.get("game/main/envinit.tjs")));
    // TODO: let vm cache module load others
    var preloadps = [];
    ScriptLoadSeq.forEach(s => {
        var sn = s.split('.')[0];
        preloadps.push(
            $.get('game/' + FilePath.find(s)[0]).promise()
                .then(sc => KSParser.Parse(sc))
                .then(sp => VM.AddScript(sn, sp))
        )
    })
    return Promise.all(preloadps);
}

$(document).ready(() => {
    $(document).click(() => VM.Next());
    LoadVMData().then(() => {
        VM.RunFrom('start');
        var preloadps = [];
        var scripts = Object.keys(FilePath.ls('scenario'));
        scripts.forEach(s => {
            var sn = s.split('.')[0];
            preloadps.push(
                $.get('game/' + FilePath.find(s)[0]).promise()
                    .then(sc => KSParser.Parse(sc))
                    .then(sp => VM.AddScript(sn, sp))
            )
        })
        Promise.all(preloadps).then(() => console.log("cache ok"));
    });
});