// Load all required stuff here
import YZCG from "./runtime/cg";
import YZLayer from "./ui/layer";
import YZSound from "./ui/sound";
import YZText from "./ui/text";
import YZVideo from "./ui/video";
import FilePath from "./utils/filepath";

export default async function Init() {
    // see: https://github.com/ant-design/ant-design/issues/13836
    const _EasterEggDate = new Date();
    if (_EasterEggDate.getDate() === 17 && _EasterEggDate.getMonth() === 8) {
        alert("苟利国家生死以，岂因祸福避趋之");
    }
    await FilePath.Load();
    YZSound.Init();
    YZText.Init();
    YZCG.Init();
    YZVideo.Init();
    YZLayer.Init();
}
