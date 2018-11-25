import AsyncTask from "./async/asynctask";
import Character from "./character";
import KSVM from "./ksvm";
import ObjectMapper from './objectmapper';
import TJSVM from "./tjsvm";
import YZBgImg from "./ui/bgimg";
import YZCG from "./ui/cg";
import YZSound from "./ui/sound";
import YZText from "./ui/text";
import YZVideo from "./ui/video";
import FilePath from './utils/filepath';
import KSParser from "./utils/ksparser";
import TJSON from "./utils/tjson";

async function LoadVMData() {
    //Unicode 万国码
    let ScriptLoadSeq = ['start.ks', '１.ks', '２.ks']
    let envinit = await FilePath.read('envinit.tjs');
    ObjectMapper.LoadObject(TJSON.parse(envinit));
    let preloadps = [];
    ScriptLoadSeq.forEach(s => {
        preloadps.push(
            (async () => {
                KSVM.AddScript(
                    s.split('.')[0],
                    KSParser.parse(await FilePath.read(s))
                );
            })()
        );
    });
    await Promise.all(preloadps);
    // TODO: too many async task in new Character()
    // Slow it down? Or let other task run first?
    Object.keys(ObjectMapper.innerobj.characters)
        .forEach(c => new Character(c));
    return;
}

TJSVM.addObject('f', {
    sak_flag: 0,
    rur_flag: 0,
    san_flag: 0,
    aoi_flag: 0,
    mah_flag: 0,
    yuk_flag: 0,
});
TJSVM.addObject('sf', {
    sakuya_clear: false,
    ruri_clear: false,
    sana_clear: false,
    aoi_clear: false,
    mahiro_clear: false,
    yukari_clear: false,
});
TJSVM.addObject('kag');

$(document).ready(async () => {
    await FilePath.Load();
    YZSound.Init();
    YZText.Init();
    YZBgImg.Init();
    YZCG.Init();
    YZVideo.Init();
    AsyncTask.Init();
    await LoadVMData();
    $(document).click(() => KSVM.Next());
    KSVM.RunFrom('start');
    KSVM.Next();
    let preloadps = [];
    // TODO: let vm cache module load other script
    let scripts = Object.keys(FilePath.ls('scenario'));
    scripts.forEach(s => {
        let sn = s.split('.')[0];
        preloadps.push(
            (async () => {
                KSVM.AddScript(
                    s.split('.')[0],
                    KSParser.parse(await FilePath.read(s))
                );
            })()
        );
    });
    await Promise.all(preloadps);
    console.debug("cache ok");
});