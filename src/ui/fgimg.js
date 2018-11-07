import FilePath from "../utils/filepath";

export default class YZFgImg {
    static Init() {
        this.imageFormat = '.png';
    }

    static HideCharacter(name) {
        let fd = $('#fg_' + name);
        fd.remove();
    }

    static DrawCharacter(name, ctl) {
        if (!ctl) return;
        let { base, layer } = ctl;

        let fd = $('#fg_' + name);
        // remove unused img
        let fgs = $('#fg_' + name + ' img');
        for (var f of fgs) {
            let i = f.id.split('_').slice(1).join('_')
            if (!Object.keys(layer).includes(i)) {
                $('#' + f.id).remove()
            }
        }
        if (!fd.length) {
            $('#imagediv').append(
                $('<div>')
                    .attr('id', 'fg_' + name)
            )
            // refresh fd
            fd = $('#fg_' + name);
        }

        let [bszx, bszy] = base.size;
        let [boffx, boffy] = base.offset;
        // set base div
        fd
            .css('display', '')
            .css('left', boffx)
            .css('top', boffy)
            .css('width', bszx)
            .css('height', bszy);

        layer.forEach(l => {

            if (!$('#fgl_' + l.layer).length) {
                // add image
                fd.append(
                    $('<img>')
                        .attr('id', 'fgl_' + l.layer)
                        .attr('src', FilePath.find(l.layer + this.imageFormat))
                );
            }
            // set image
            let [lszx, lszy] = l.size;
            let [loffx, loffy] = l.offset;
            $('#fgl_' + l.layer)
                .css('left', loffx)
                .css('top', loffy)
                .css('width', lszx)
                .css('height', lszy)
                .css('z-index', l.zindex + 5000)
        })
    }
}

YZFgImg.Init();