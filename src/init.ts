// Load all required stuff here
import YZSound from "./ui/sound";
import YZText from "./ui/text";
import YZVideo from "./ui/video";
import FilePath from "./utils/filepath";
import { DebugInit } from "./debugtool";
import LayerEV from "./runtime/layer/ev";
import YZLayerMgr from "./ui/layermgr";

export default async function Init() {
    // see: https://github.com/ant-design/ant-design/issues/13836
    // the value from Date.getMonth() starts with 0
    const _EasterEggDate = new Date();
    if (_EasterEggDate.getDate() === 17 && _EasterEggDate.getMonth() === 7) { // 别问，问就是JS如此
        alert("🐸🐸🐸");
    }
    await FilePath.Load();
    YZSound.Init();
    YZText.Init();
    YZVideo.Init();
    YZLayerMgr.Init();
    LayerEV.Init();
    DebugInit();
}
