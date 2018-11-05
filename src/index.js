import TJSON from "./utils/tjson";
import KSParser from "./utils/ksparser";
import KSVM from "./ksvm";
import Runtime from "./runtime";
import ObjectMapper from './objmapper';
import FilePath from './utils/filepath';
import YZFgImg from "./ui/fgimg";

var scenes = [];

Runtime.TJShack = {
    "f.all_clear_check=(sf.sakuya_clear && sf.ruri_clear && sf.sana_clear && sf.aoi_clear && sf.mahiro_clear && sf.yukari_clear)": 1,
    "!(f.sak_flag == 5 || f.all_clear_check)": true,
    "!kag.isRecollection": true
};
Runtime.TJSvar = {
    "f.all_clear_check": true,
    "f.sak_flag": 0,
    "f.san_flag": 0,
    "f.aoi_flag": 0,
    "f.mah_flag": 0,
    "f.rur_flag": 0,
    "f.yuk_flag": 0,
};

async function LoadVMData() {
    var ScriptLoadSeq = ['start.ks', '１.ks', '２.ks']
    await FilePath.Load();
    YZFgImg.LoadData('fgimage');
    ObjectMapper.LoadObject(TJSON.Parse(await $.get("game/main/envinit.tjs")));
    // TODO: let vm cache module load others
    var preloadps = [];
    ScriptLoadSeq.forEach(s => {
        var sn = s.split('.')[0];
        preloadps.push(
            $.get(FilePath.find(s)).promise()
                .then(sc => KSParser.Parse(sc))
                .then(sp => KSVM.AddScript(sn, sp))
        )
    })
    return Promise.all(preloadps);
}

$(document).ready(() => {
    $(document).click(() => KSVM.Next());
    LoadVMData().then(() => {
        KSVM.RunFrom('start');
        var preloadps = [];
        var scripts = Object.keys(FilePath.ls('scenario'));
        scripts.forEach(s => {
            var sn = s.split('.')[0];
            preloadps.push(
                $.get(FilePath.find(s)).promise()
                    .then(sc => KSParser.Parse(sc))
                    .then(sp => KSVM.AddScript(sn, sp))
            )
        })
        Promise.all(preloadps).then(() => console.debug("cache ok"));
    });
});