import TJSVM from "../tjsvm";

export default class YZSelect {
    static Init() {
        this.MapSelectData = [];
        this.SelectData = [];
    }
    // TODO: mselect is Tenshin Ranman only command?
    // add map select option
    static MapSelectAdd(cmd) {
        let p = cmd.param;
        this.MapSelectData.push({
            name: p.name,
            target: p.target,
            cond: p.cond,
            storage: p.storage,
            place: p.place
        });
    }

    // raise a map select
    static async MapSelect() {
        var s = "Map:\n";
        var n = 0;
        for (const d of this.MapSelectData) {
            s += n;
            s += d.name;
            s += '\n';
            n++;
        }
        var r = prompt(s, 0);
        var ro = this.MapSelectData[r];
        this.MapSelectData = [];
        if (!ro.target && !ro.storage) return undefined;
        return [ro.target, ro.storage];
    }

    static SelectAdd(cmd) {
        let p = cmd.param;
        this.SelectData.push({
            text: p.text,
            target: p.target,
            exp: p.exp,
            storage: p.storage
        });
    }

    // raise a normal select
    static async Select() {
        var s = "";
        var n = 0;
        for (const d of this.SelectData) {
            s += n;
            s += d.text;
            s += '\n';
            n++;
        }
        var r = prompt(s, 0);
        var ro = this.SelectData[r];
        if (ro.exp) TJSVM.eval(ro.exp);
        this.SelectData = [];
        if (!ro.target && !ro.storage) return undefined;
        return [ro.target, ro.storage];
    }

    static Next(cmd) {
        let { name, param, option } = cmd;
        if (param.eval != undefined) {
            let r = TJSVM.eval(cmd.param.eval);
            // cancel jump
            if (!r) return undefined;
        }
        return [param.target, param.storage]
    }
}
YZSelect.Init();