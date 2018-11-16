import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";

export default class YZCG {
    static Init() {
        this.evfd = $('#evdiv');
        this.datefd = $('#datediv');
        this.layerfd = $('#layerdiv');
        this.imageFormat = ".png";
    }

    static NewLay(cmd) {
        let { name, option, param } = cmd;
        let lname = param.name;
        let lfile = param.file;

        let lfd = $(`#layer_${lname}`);
        if (lfd.length > 0) {
            lfd.remove();
        }
        this.layerfd.append(
            $('<img>')
                .attr('id', `layer_${lname}`)
                .attr('src', FilePath.find(lfile + this.imageFormat))
                //.css('display', 'none')
        );

        this.LayerCtl({
            name: lname,
            option: option,
            param: param
        });
    }

    static DelLay(cmd) {
        $(`#layer_${cmd.param.name}`).remove();
    }

    static LayerCtl(cmd) {

    }

    static EV(cmd) {
        let { name, option, param } = cmd;
    }

    static Date(cmd) {
        let { name, option, param } = cmd;
    }
}