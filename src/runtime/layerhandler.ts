import ObjectMapper from "../objectmapper";
import Character from "./character";
import YZBgImg from "./bgimg";
import YZCG from "./cg";

export default class YZLayerHandler {
    static isLayer(cmd: KSLine) {
        if (["newlay", "dellay"].includes(cmd.name)) return true;
        return ["characters", "times", "stages", "layer"]
            .includes(ObjectMapper.TypeOf(cmd.name));
    }

    // layerhandler
    // resolve name
    // resolve position
    // resolve display
    // resolve animation
    static async Process(cmd: KSLine) {
        if (cmd.name == "newlay") {
            YZCG.NewLay(cmd);
        }
        if (cmd.name == "dellay") {
            YZCG.DelLay(cmd);
        }
        let cb: (cmd?: KSLine) => any = () => { };
        switch (ObjectMapper.TypeOf(cmd.name)) {
            case "characters":
                cb = async (cmd: KSLine) => await Character.characters[cmd.name].Process(cmd);
                break;
            case "times":
                cb = async (cmd: KSLine) => await YZBgImg.SetDaytime(cmd.name);
                break;
            case "stages":
                cb = async (cmd: KSLine) => await YZBgImg.Process(cmd);
                break;
            case "layer":
                cb = async (cmd: KSLine) => await YZCG.ProcessLay(cmd);
                break;
        }
        console.log(await cb(cmd), this.CalculatePosition(cmd));
    }

    // name reslover : input a full cmd, output layers and name


    // position resolver
    static CalculatePosition(cmd: KSLine) {
        // xpos and ypos will cover other value
        let { name, option, param } = cmd;
        console.log(option);
        let mapped = ObjectMapper.ConvertAll(option);
        const mapX = ((mapped.positions || [])
            .filter((p: any) => p.xpos !== undefined)
            .map((p: any) => p.xpos)[0])
            || undefined;
        const paramX = (param.xpos !== undefined) ? param.xpos : undefined;
        const paramY = (param.ypos !== undefined) ? param.ypos : undefined;

        const finalX = mapX || paramX;
        const finalY = paramY;
        return [finalX, finalY];
    }
}