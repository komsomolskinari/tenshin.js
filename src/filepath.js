

export class FilePath {

    // load file tree from system
    static async Read() {
        if (_reading == true || _finished == true) return;
        _reading = true;

        _urls = ['/'];



    }

    static async _readdir(url) {
        var json = await $.ajax(url).promise();
        var dirs = json.filter(d => d.type == "directory").map(d => url + d.name + '/');
        var files = json.filter(d => d.type == "file").map(d => url + d.name);
    }
}