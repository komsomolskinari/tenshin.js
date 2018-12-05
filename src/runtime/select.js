import TJSVM from "../tjsvm";
import YZSelectUI from "../ui/select";

export class YZSelectData {
    /**
     * 
     * @param {String} text Text to show
     * @param {[String,String]} dest When selected, dest position
     * @param {String} operation When selected, TJS to run (when map, only when true, show this option)
     * @param {*} mapplace On which position
     */
    constructor(text, dest, operation, mapplace) {
        this.text = text;
        this.dest = dest;
        this.operation = operation;
        this.mapplace = mapplace;
        if (!dest[0] && !dest[1]) this.dest = undefined;
    }
}


// all select logic here
export default class YZSelect {
    static Init() {
        this.MapSelectData = [];
        this.SelectData = [];
    }
    // TODO: mselect is Tenshin Ranman only command?
    // add map select option
    static MapSelectAdd(cmd) {
        let p = cmd.param;
        this.MapSelectData.push(
            new YZSelectData(p.name, [p.target, p.storage], p.cond, p.place)
        );
    }

    // raise a map select
    static async MapSelect() {
        let ro = await YZSelectUI.MSelect(this.MapSelectData);
        this.MapSelectData = [];
        if (!ro.dest) return undefined;
        return ro.dest;
    }

    static SelectAdd(cmd) {
        let p = cmd.param;
        this.SelectData.push(
            new YZSelectData(p.text, [p.target, p.storage], p.exp, p.storage)
        );
    }

    // raise a normal select
    static async Select() {
        let ro = await YZSelectUI.Select(this.SelectData);
        if (ro.operation) TJSVM.eval(ro.operation);
        this.SelectData = [];
        if (!ro.dest) return undefined;
        return [ro.dest];
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