import ObjectMapper from "../objectmapper";
import FilePath from "../utils/filepath";

export default class YZCG {
    static Init() {
        this.evfd = $('#evdiv');
        this.datefd = $('#datediv');
        this.layerfd = $('#layerdiv');
        this.imageFormat = ".png";
        this.layerlast = {};
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
        );

        this.layerlast[lname] = {
            x: 0,
            y: 0,
            zoom: 100
        }

        this.LayerCtl({
            name: lname,
            option: option,
            param: param
        });
        ObjectMapper.AddLayer(lname);
    }

    static DelLay(cmd) {
        $(`#layer_${cmd.param.name}`).remove();
        ObjectMapper.RemoveLayer(cmd.param.name);
    }

    static async LayerCtl(cmd) {
        console.log('layerctl', cmd);
        let { name, option, param } = cmd;

        let fd = $(`#layer_${name}`);
        let origx = parseInt(fd.get(0).naturalWidth);
        let origy = parseInt(fd.get(0).naturalHeight);
        if (origx + origy <= 0) {
            await new Promise((resolve, reject) => {
                fd.on('load', () => resolve());
                fd.on('error', () => reject());
            })
            origx = parseInt(fd.get(0).naturalWidth);
            origy = parseInt(fd.get(0).naturalHeight);
        }
        fd
            .off('load')
            .off('error');

        if (option.includes('show')) {
            fd.css('display', '')
        }
        if (option.includes('hide')) {
            fd.css('display', 'none')
        }

        let last = this.layerlast[name];

        // split a low level image lib?
        let x = (param.xpos !== undefined) ? param.xpos : last.x;
        let y = (param.ypos !== undefined) ? param.ypos : last.y;
        let zoom = param.zoom || last.zoom;
        x = parseInt(x);
        y = parseInt(y);
        zoom = parseInt(zoom);
        this.layerlast[name] = { x, y, zoom }
        let rzoom = zoom / 100;

        let [curx, cury] = [origx * rzoom, origy * rzoom]
        let [cx, cy] = [curx / 2, cury / 2];
        let [offx, offy] = [640 - cx, 360 - cy];
        [offx, offy] = [offx + x, offy + y];
        fd
            .css('width', curx)
            .css('height', cury)
            .css('left', offx)
            .css('top', offy)
    }

    static EV(cmd) {
        let { name, option, param } = cmd;
    }

    static Date(cmd) {
        let { name, option, param } = cmd;
    }
}