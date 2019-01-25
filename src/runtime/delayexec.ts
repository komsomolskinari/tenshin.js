import Runtime from "../runtime";

export default class DelayExec {
    static perLabelCmds: {
        [tag: string]: KSFunc[]
    } = {};

    /**
     * Execute after time:
     * @param cmd command to execute
     * @param time after time ms
     */
    static AfterTime(cmd: KSFunc, time: number) {
        setTimeout(() => Runtime.Call(cmd), time);
    }

    /**
     * When sound played to label
     * @param cmd command to execute
     * @param label Sould label to wait
     */
    static AtSoundLabel(cmd: KSFunc, label: string) {
        if (this.perLabelCmds[label] === undefined) this.perLabelCmds[label] = [];
        this.perLabelCmds[label].push(cmd);
    }

    /**
     * Recieve a sound label from sound subsystem
     * @param label Tag recived
     */
    static async RecieveLabel(label: string) {
        if (this.perLabelCmds[label] === undefined) return;
        await Promise.all(this.perLabelCmds[label].map(t =>
            (async () => Runtime.Call(t))()
        ));
        delete this.perLabelCmds[label];
    }

    static CancelAllLabel() {
        this.perLabelCmds = {};
    }
}
