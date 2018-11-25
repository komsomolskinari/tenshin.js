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
import YZVideo from "./ui/video";

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

TJSVM.addObject('f');
TJSVM.addObject('sf');
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
    KSVM.RunFrom('start');
    $(document).click(() => KSVM.Next());
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