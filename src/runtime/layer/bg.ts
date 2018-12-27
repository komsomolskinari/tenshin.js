import LayerBase from "./base";
import ObjectMapper from "../../objectmapper";

export default class LayerBG extends LayerBase {
    readonly positionZoom = 0.3;
    public static Init() {
        return;
    }
    public static GetInstance(cmd?: KSFunc): LayerBG {
        if (this.instance === undefined) {
            this.instance = new LayerBG();
        }
        return this.instance;
    }
    private static instance: LayerBG = undefined;

    private cgName = "";
    private daytime: any = undefined;
    private stage: any = undefined;
    readonly channelName = "background";

    CalculateSubLayer(cmd: KSFunc): LayerControlData {
        switch (ObjectMapper.TypeOf(cmd.name)) {
            case "stages":
                const { name, option, param } = cmd;
                this.stage = ObjectMapper.GetProperty(name);

                // inline time
                const inlineTime = (option.filter(o => ObjectMapper.TypeOf(o as string) === "times") || [])[0];
                if (inlineTime) {
                    this.daytime = ObjectMapper.GetProperty(inlineTime);
                }
                let reload = false;
                if (this.stage.image !== this.cgName) reload = true;
                this.cgName = this.stage.image;
                return { name: this.channelName, layer: [{ name: this.stage.image.replace("TIME", this.daytime.prefix) }], reload };
            case "times":
                this.daytime = ObjectMapper.GetProperty(cmd.name);
                return { name: this.channelName, layer: [] };
        }
    }
}
