import LayerBase from "./base";
import ObjectMapper from "../../objectmapper";
import LayerUIMgr from "../../ui/layermgr";
export default class LayerExtra extends LayerBase {
    readonly zindex = 17;
    public static Init() {
        return;
    }
    public static GetInstance(cmd?: KSFunc): LayerExtra {
        if (this.instance === undefined) {
            this.instance = new LayerExtra();
        }
        return this.instance;
    }
    private static instance: LayerExtra = undefined;

    CalculateSubLayer(cmd: KSFunc): LayerInfo[] {
        switch (cmd.name) {
            case "newlay":
                const { name, option, param } = cmd;
                const lname = param.name;
                const lfile = param.file;
                if (!lfile) { return; }
                ObjectMapper.AddLayer(lname);
                return [{ name: lfile }];
            case "dellay":
                LayerUIMgr.Unset(cmd.param.name);
                ObjectMapper.RemoveLayer(cmd.param.name);
                return undefined;
            default:
                return [];
        }
    }
    CalculateName(cmd: KSFunc): string {
        switch (cmd.name) {
            case "newlay":
                const { name, option, param } = cmd;
                const lname = param.name;
                const lfile = param.file;
                if (!lfile) { return; }
                ObjectMapper.AddLayer(lname);
                return lname;
            case "dellay":
                LayerUIMgr.Unset(cmd.param.name);
                ObjectMapper.RemoveLayer(cmd.param.name);
                return "";
            default:
                return cmd.name;
        }
    }
}
