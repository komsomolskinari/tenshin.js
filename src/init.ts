// Load all required stuff here
import AsyncTask from "./async/asynctask";
import YZBgImg from "./runtime/bgimg";
import YZCG from "./runtime/cg";
import YZLayerMgr from "./ui/layer";
import YZSound from "./ui/sound";
import YZText from "./ui/text";
import YZVideo from "./ui/video";

export default async function Init() {
    await FilePath.Load();
    YZSound.Init();
    YZText.Init();
    YZBgImg.Init();
    YZCG.Init();
    YZVideo.Init();
    AsyncTask.Init();
    YZLayerMgr.Init();
}