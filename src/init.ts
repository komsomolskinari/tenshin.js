// 蛤蛤蛤
// Load all required stuff here
import { DebugInit } from "./debugtool";
import KSVM from "./ksvm";
import ObjectMapper from "./objectmapper";
import KSParser from "./parser/ksparser";
import TJSON from "./parser/tjson";
import LayerChara from "./runtime/layer/chara";
import LayerEV from "./runtime/layer/ev";
import LayerUIMgr from "./ui/layermgr";
import SoundUI from "./ui/sound";
import TextUI from "./ui/text";
import VideoUI from "./ui/video";
import FilePath from "./utils/filepath";

export default async function Init() {
    // see: https://github.com/ant-design/ant-design/issues/13836
    // the value from Date.getMonth() starts with 0
    const _EasterEggDate = new Date();
    if (_EasterEggDate.getDate() === 17 && _EasterEggDate.getMonth() === 7) { // 别问，问就是JS如此
        alert("🐸🐸🐸");
    }
    await FilePath.Load();
    TextUI.Init();
    VideoUI.Init();
    LayerUIMgr.Init();
    LayerEV.Init();
    SoundUI.Init();
    DebugInit();


    const scriptLoadSeq = Config.Boot.InitialScripts;
    const envinit = await FilePath.read(Config.Boot.EnvInitFile);
    ObjectMapper.LoadObject(TJSON.parse(envinit));
    await Promise.all(scriptLoadSeq.map(s =>
        (async () =>
            KSVM.AddScript(
                s.split(".")[0],
                KSParser.parse(await FilePath.read(s))
            )
        )()
    ));
    // TODO: too many async task in new Character()
    // Slow it down? Or let other task run first?
    LayerChara.Init();
    return;
}
