import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";

export default class YZCG {
    static Init() {
        this.evfd = $('#evdiv');
        this.datefd = $('#datediv');
        this.layerfd = $('#layerdiv');
    }

    static NewLay(cmd) {
        let { name, option, param } = cmd;
    }

    static DelLay(cmd) {
        let { name, option, param } = cmd;
    }

    static LayerCtl() {

    }

    static EV(cmd) {
        let { name, option, param } = cmd;
    }

    static Date(cmd) {
        let { name, option, param } = cmd;
    }
}
YZCG.Init();