// real eval
// REAL! WILL EXECUTE CODE!
// Not a TJS virtual machine, just a JS eval wrapper
export default class TJSVM {
    private static objs: { [prop: string]: any } = {};
    private static params: string[] = [];

    /**
     * evaluate a tjs function
     * @param str
     */
    public static eval(str: string): any {
        const func = new Function(...this.params, "'use strict;'; return " + str);
        // manually bind params
        const funcWithParam = this.params.reduce((f, p) => f.bind(undefined, this.objs[p]), func);
        return funcWithParam();
    }
    /**
     * Add TJSVM variable
     * @param name Object name
     * @param obj Initial value, default = {}
     */
    public static addObject(name: string, obj: { [prop: string]: any }) {
        this.objs[name] = (obj || {});
        this.params.push(name);
    }
    /**
     * Get variable
     * @param name variable
     * @example TJSVM.get('f.voiceBase');
     */
    public static get(name: string): any {
        return name
            .split(".")
            .reduce((p, c) => p === undefined ? undefined : p[c], this.objs);
    }
}