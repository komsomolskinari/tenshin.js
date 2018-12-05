import ObjectMapper from "../objectmapper";
import Character from "./character";
import YZBgImg from "./bgimg";
import YZCG from "./cg";

const KAGConst = {
    Both: "KAGEnvImage.BOTH",
    BU: "KAGEnvImage.BU",
    Clear: "KAGEnvImage.CLEAR",
    Face: "KAGEnvImage.FACE",
    Invisible: "KAGEnvImage.INVISIBLE",
    DispPosition: "KAGEnvironment.DISPPOSITION",
    XPosition: "KAGEnvironment.XPOSITION",
    Level: "KAGEnvironment.LEVEL"
}

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
    static async Process(cmd) {
        if (cmd.name == "newlay") {
            YZCG.NewLay(cmd);
        }
        if (cmd.name == "dellay") {
            YZCG.DelLay(cmd);
        }
        let cb = () => { };
        switch (ObjectMapper.TypeOf(cmd)) {
            case "characters":
                cb = async cmd => await Character.characters[cmd.name].Process(cmd);
                break;
            case "times":
                cb = async cmd => await YZBgImg.SetDaytime(cmd.name);
                break;
            case "stages":
                cb = async cmd => await YZBgImg.Process(cmd);
                break;
            case "layer":
                cb = async cmd => await YZCG.ProcessLay(cmd);
                break;
        }
        console.log(await cb(cmd), this.CalculatePosition(cmd));
    }

    // name reslover : input a full cmd, output layers and name


    // position resolver
    static CalculatePosition(cmd) {
        // xpos and ypos will cover other value
        let { name, option, param } = cmd;
        console.log(option);
        let mapped = ObjectMapper.ConvertAll(option);
        const mapX = ((mapped.positions || [])
            .filter(p => p.xpos !== undefined)
            .map(p => p.xpos)[0])
            || undefined;
        const paramX = (param.xpos !== undefined) ? param.xpos : undefined;
        const paramY = (param.ypos !== undefined) ? param.ypos : undefined;

        const finalX = mapX || paramX;
        const finalY = paramY;
        return [finalX, finalY];
    }
}