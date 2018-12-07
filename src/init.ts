// Load all required stuff here
import YZBgImg from "./runtime/bgimg";
import YZCG from "./runtime/cg";
import YZLayerMgr from "./ui/layer";
import YZSound from "./ui/sound";
import YZText from "./ui/text";
import YZVideo from "./ui/video";
import FilePath from "./utils/filepath";

export default async function Init() {
    await FilePath.Load();
    YZSound.Init();
    YZText.Init();
    YZBgImg.Init();
    YZCG.Init();
    YZVideo.Init();
    YZLayerMgr.Init();
}