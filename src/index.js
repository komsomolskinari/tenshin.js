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
import YZLayerMgr from "./ui/layer";
async function LoadVMData() {
    const ScriptLoadSeq = Config.Boot.InitialScripts;
    let envinit = await FilePath.read(Config.Boot.EnvInitFile);
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

Object.keys(Config.Boot.TJSVariable)
    .forEach(k => TJSVM.addObject(k, Config.Boot.TJSVariable[k]))

$(document).ready(async () => {
    await FilePath.Load();
    YZSound.Init();
    YZText.Init();
    YZBgImg.Init();
    YZCG.Init();
    YZVideo.Init();
    AsyncTask.Init();
    YZLayerMgr.Init();
    await LoadVMData();
    $(document).click(() => KSVM.Next());
    KSVM.RunFrom(Config.Boot.EntryTag);
    KSVM.Next();
    let preloadps = [];
    // TODO: let vm cache module load other script
    let scripts = Object.keys(FilePath.ls(Config.Boot.ScenarioPath));
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