import Character from "./character";
import KSVM from "./ksvm";
import ObjectMapper from './objectmapper';
import Runtime from "./runtime";
import YZBgImg from "./ui/bgimg";
import YZSound from "./ui/sound";
import YZText from "./ui/text";
import AsyncTask from "./async/asynctask";
import FilePath from './utils/filepath';
import KSParser from "./utils/ksparser";
import TJSON from "./utils/tjson";
import Preloader from "./async/preload";
import YZCG from "./ui/cg";

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
    let ScriptLoadSeq = ['start.ks', '１.ks', '２.ks']
    let envinit = await $.get(FilePath.find('envinit.tjs'));
    ObjectMapper.LoadObject(TJSON.parse(envinit));
    let preloadps = [];
    ScriptLoadSeq.forEach(s => {
        let sn = s.split('.')[0];
        preloadps.push(
            $.get(FilePath.find(s)).promise()
                .then(sc => KSParser.parse(sc))
                .then(sp => KSVM.AddScript(sn, sp))
        );
    });
    await Promise.all(preloadps);
    // TODO: too many async task in new Character()
    // Slow it down? Or let other task run first?
    Object.keys(ObjectMapper.innerobj.characters)
        .forEach(c => new Character(c));
    return;
}

$(document).ready(async () => {
    await FilePath.Load();
    YZSound.Init();
    YZText.Init();
    YZBgImg.Init();
    YZCG.Init();
    AsyncTask.Init();
    $(document).click(() => KSVM.Next());
    await LoadVMData();
    KSVM.RunFrom('start');
    let preloadps = [];
    // TODO: let vm cache module load other script
    let scripts = Object.keys(FilePath.ls('scenario'));
    scripts.forEach(s => {
        let sn = s.split('.')[0];
        preloadps.push(
            $.get(FilePath.find(s)).promise()
                .then(sc => KSParser.parse(sc))
                .then(sp => KSVM.AddScript(sn, sp))
        );
    });
    await Promise.all(preloadps);
    console.debug("cache ok");
});