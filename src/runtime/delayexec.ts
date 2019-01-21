import Runtime from "../runtime";

export default class DelayExec {
    static perLabelCmds: {
        [tag: string]: KSFunc[]
    } = {};

    static AfterTime(cmd: KSFunc, time: number) {
        setTimeout(() => Runtime.Call(cmd), time);
    }

    static AtSoundLabel(cmd: KSFunc, tag: string) {
        if (this.perLabelCmds[tag] === undefined) this.perLabelCmds[tag] = [];
        this.perLabelCmds[tag].push(cmd);
    }

    static async RecieveLabel(tag: string) {
        if (this.perLabelCmds[tag] === undefined) return;
        await Promise.all(this.perLabelCmds[tag].map(t =>
            (async () => Runtime.Call(t))()
        ));
        delete this.perLabelCmds[tag];
    }

    static CancelAllLabel() {
        this.perLabelCmds = {};
    }
}
