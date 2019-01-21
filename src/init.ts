// Load all required stuff here
import { DebugInit } from "./debugtool";
import LayerEV from "./runtime/layer/ev";
import LayerUIMgr from "./ui/layermgr";
import TextUI from "./ui/text";
import VideoUI from "./ui/video";
import FilePath from "./utils/filepath";
import SoundUI from "./ui/sound";

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
}
