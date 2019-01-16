// Load all required stuff here
import { DebugInit } from "./debugtool";
import LayerEV from "./runtime/layer/ev";
import Sound from "./runtime/sound";
import YZLayerMgr from "./ui/layermgr";
import YZText from "./ui/text";
import YZVideo from "./ui/video";
import FilePath from "./utils/filepath";

export default async function Init() {
    // see: https://github.com/ant-design/ant-design/issues/13836
    // the value from Date.getMonth() starts with 0
    const _EasterEggDate = new Date();
    if (_EasterEggDate.getDate() === 17 && _EasterEggDate.getMonth() === 7) { // 别问，问就是JS如此
        alert("🐸🐸🐸");
    }
    await FilePath.Load();
    YZText.Init();
    YZVideo.Init();
    YZLayerMgr.Init();
    LayerEV.Init();
    Sound.Init();
    DebugInit();
}
