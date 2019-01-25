// real eval
// REAL! WILL EXECUTE CODE!
// Not a TJS virtual machine, just a JS eval wrapper
export default class TJSVM {
    private static objs: { [prop: string]: any } = {};
    private static params: string[] = [];

    /**
     * evaluate a tjs function
     * @param codeStr
     */
    public static eval(codeStr: string): any {
        const func = new Function(...this.params, "'use strict;'; return " + codeStr);
        // manually bind params
        const funcWithParam = this.params.reduce((f, p) => f.bind(undefined, this.objs[p]), func);
        return funcWithParam();
    }

    /**
     * Add TJSVM variable
     * @param objectName Object name
     * @param object Initial value, default = {}
     */
    public static addObject(objectName: string, object: { [prop: string]: any }) {
        this.objs[objectName] = (object || {});
        this.params.push(objectName);
    }

    /**
     * Get variable
     * @param varName variable
     * @example TJSVM.get('f.voiceBase');
     */
    public static get(varName: string): any {
        return varName
            .split(".")
            .reduce((p, c) => p === undefined ? undefined : p[c], this.objs);
    }
}
