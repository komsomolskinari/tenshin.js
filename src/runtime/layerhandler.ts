import ObjectMapper from "../objectmapper";
import Character from "./character";
import YZBgImg from "./bgimg";
import YZCG from "./cg";
import YZLayerMgr from "../ui/layer";

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
        if (cmd.name === "newlay") {
            YZCG.NewLay(cmd);
        }
        if (cmd.name === "dellay") {
            YZCG.DelLay(cmd);
        }
        let cb: (cmd?: KSLine) => Promise<LayerControlData> = () => { return undefined; };
        switch (ObjectMapper.TypeOf(cmd.name)) {
            case "characters":
                cb = async (cmd: KSLine) => Character.characters[cmd.name].Process(cmd);
                break;
            case "times":
                cb = async (cmd: KSLine) => YZBgImg.SetDaytime(cmd.name);
                break;
            case "stages":
                cb = async (cmd: KSLine) => YZBgImg.Process(cmd);
                break;
            case "layer":
                cb = async (cmd: KSLine) => YZCG.ProcessLay(cmd);
                break;
        }
        const controlData = await cb(cmd);
        if (!controlData) debugger;
        const name = controlData.name;
        const position = this.CalculatePosition(cmd);
        YZLayerMgr.Set(name, controlData.layer);
        YZLayerMgr.Move(name, position);
        YZLayerMgr.Draw(name);
    }

    // name reslover : input a full cmd, output layers and name

    // position resolver
    // not applied yet
    static CalculatePosition(cmd: KSLine): Point {
        // xpos and ypos will cover other value
        const { name, option, param } = cmd;
        const mapped = ObjectMapper.ConvertAll(option);
        const mapX = ((mapped.positions || [])
            .filter((p: any) => p.xpos !== undefined)
            .map((p: any) => p.xpos)[0])
            || undefined;
        const paramX = (param.xpos !== undefined) ? param.xpos : undefined;
        const paramY = (param.ypos !== undefined) ? param.ypos : undefined;

        const finalX = mapX || paramX;
        const finalY = paramY;
        return { x: finalX, y: finalY as number };
    }
}
