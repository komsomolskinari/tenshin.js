import TJSVM from "../tjsvm";
import SelectUI from "../ui/select";

export class SelectData {
    text: string;
    dest: JumpDest;
    operation: string;
    mapplace: any;
    /**
     *
     * @param text Text to show
     * @param dest When selected, dest position
     * @param operation When selected, TJS to run (when map, only when true, show this option)
     * @param mapplace On which position
     */
    constructor(text: string, dest: JumpDest, operation: string, mapplace: any) {
        this.text = text;
        this.dest = dest;
        this.operation = operation;
        this.mapplace = mapplace;
        if (!dest.script && !dest.target) this.dest = undefined;
    }
}

// all select logic here
export default class Select {
    static mapSelectData: SelectData[] = [];
    static selectData: SelectData[] = [];

    static MapSelectInit() {
        this.mapSelectData = [];
    }

    // TODO: mselect is Tenshin Ranman only command?
    // add map select option
    static MapSelectAdd(cmd: KSFunc) {
        const p = cmd.param;
        this.mapSelectData.push(
            new SelectData(
                p.name,
                {
                    script: p.storage,
                    target: p.target
                },
                p.cond,
                p.place)
        );
    }

    // raise a map select
    static async MapSelect() {
        const ro = await SelectUI.MSelect(this.mapSelectData);
        this.mapSelectData = [];
        if (!ro.dest) return undefined;
        return ro.dest;
    }

    static SelectAdd(cmd: KSFunc) {
        const p = cmd.param;
        this.selectData.push(
            new SelectData(
                p.text,
                {
                    script: p.storage,
                    target: p.target,
                },
                p.exp,
                p.storage)
        );
    }

    // raise a normal select
    static async Select() {
        const ro = await SelectUI.Select(this.selectData);
        if (ro.operation) TJSVM.eval(ro.operation);
        this.selectData = [];
        if (!ro.dest) return undefined;
        return ro.dest;
    }

    static Next(cmd: KSFunc): JumpDest {
        const { name, param, option } = cmd;
        if (param.eval !== undefined) {
            const r = TJSVM.eval(cmd.param.eval);
            // cancel jump
            if (!r) return undefined;
        }
        return { script: param.storage, target: param.target };
    }
}
