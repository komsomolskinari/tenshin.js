// real eval
// REAL! WILL EXECUTE CODE!
// Not a TJS virtual machine, just a JS eval wrapper
export default class TJSVM {

    static objs: { [prop: string]: any } = {};
    static params: string[] = [];

    /**
     * evaluate a tjs function
     * @param {String} str 
     */
    static eval(str: string): any {
        let func = new Function(...this.params, "'use strict;'; return " + str);
        // manually bind params
        let funcWithParam = this.params.reduce((f, p) => f.bind(undefined, this.objs[p]), func);
        return funcWithParam();
    }
    /**
     * Add TJSVM variable
     * @param {String} name Object name
     * @param {Object} obj Initial value, default = {}
     */
    static addObject(name: string, obj: { [prop: string]: any }) {
        this.objs[name] = (obj || {});
        this.params.push(name);
    }
    /**
     * Get variable
     * @param {String} name variable
     * @example TJSVM.get('f.voiceBase');
     */
    static get(name: string): any {
        return name
            .split('.')
            .reduce((p, c) => p === undefined ? undefined : p[c], this.objs);
    }
}