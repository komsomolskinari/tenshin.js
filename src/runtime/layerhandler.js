import ObjectMapper from "../objectmapper";
import Character from "./character";
import YZBgImg from "./bgimg";
import YZCG from "./cg";

export default class YZLayerHandler {
    static isLayer(cmd) {
        if (["newlay", "dellay"].includes(cmd.name)) return true;
        return ["characters", "times", "stages", "layer"]
            .includes(ObjectMapper.TypeOf(cmd));
    }

    // layerhandler
    // resolve name
    // resolve position
    // resolve display
    // resolve animation
    static Process(cmd) {
        if (cmd.name == "newlay") {
            YZCG.NewLay(cmd);
        }
        if (cmd.name == "dellay") {
            YZCG.DelLay(cmd);
        }


        switch (ObjectMapper.TypeOf(cmd)) {
            case "characters":
                Character.characters[cmd.name].Process(cmd);
                break;
            case "times":
                YZBgImg.SetDaytime(cmd.name);
                break;
            case "stages":
                YZBgImg.Process(cmd);
                break;
            case "layer":
                YZCG.ProcessLay(cmd);
                break;
        }
    }



    // name reslover : input a full cmd, output layers and name
}