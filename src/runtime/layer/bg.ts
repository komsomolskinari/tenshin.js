import LayerBase from "./base";
import ObjectMapper from "../../objectmapper";

export default class LayerBG extends LayerBase {
    readonly zindex = 1;
    readonly channelName = "background";
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

    CalculateSubLayer(cmd: KSFunc): LayerInfo[] {
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
                const daytimePfx = this.daytime ? this.daytime.prefix : "";
                return [{ name: this.stage.image.replace("TIME", daytimePfx) }];
            case "times":
                this.daytime = ObjectMapper.GetProperty(cmd.name);
                return [];
        }
    }
    CalculateName(cmd: KSFunc): string {
        return this.channelName;
    }
    CalculatePosition(cmd: KSFunc): Point {
        return super.CalculatePositionWithPZoom(cmd, 0.3);
    }
}
