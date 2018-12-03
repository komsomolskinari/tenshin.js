import AsyncTask from "./async/asynctask";
import Character from "./runtime/character";
import KSVM from "./ksvm";
import ObjectMapper from './objectmapper';
import TJSVM from "./tjsvm";
import YZBgImg from "./runtime/bgimg";
import YZCG from "./runtime/cg";
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
    await Promise.all(ScriptLoadSeq.map(s =>
        (async () =>
            KSVM.AddScript(
                s.split('.')[0],
                KSParser.parse(await FilePath.read(s))
            )
        )()
    ));
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
    // TODO: let vm cache module load other script
    let scripts = Object.keys(FilePath.ls(Config.Boot.ScenarioPath));
    await Promise.all(scripts.map(s =>
        (async () =>
            KSVM.AddScript(
                s.split('.')[0],
                KSParser.parse(await FilePath.read(s))
            )
        )()
    ));
    console.debug("cache ok");
});