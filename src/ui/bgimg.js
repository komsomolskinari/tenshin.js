import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";

export default class YZBgImg {
    static Init() {
        this.daytime = undefined;
        this.stage = undefined;
        this.curImg = "";
        this.imageFormat = ".png"
        this.bgfd = $('#bgimg');
    }

    static SetDaytime(time) {
        if (ObjectMapper.TypeOf(time) == "times")
            this.daytime = ObjectMapper.GetProperty(time);
    }

    static Process(cmd) {
        let { name, option, param } = cmd;
        this.stage = ObjectMapper.GetProperty(name);
        this.curImg = this.stage.image.replace('TIME', this.daytime.prefix);
        let bgPath = FilePath.find(this.curImg + this.imageFormat);
        this.bgfd.attr('src', bgPath);
        console.log(option, param);
    }
}