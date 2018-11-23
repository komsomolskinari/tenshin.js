// real eval
// REAL! WILL EXECUTE CODE!
// Not a TJS virtual machine, just a JS eval wrapper
export default class TJSVM {

    static Init() {
        this.objs = {};
        this.params = [];
    }

    /**
     * evaluate a tjs function
     * @param {String} str 
     */
    static eval(str) {
        let func = new Function(this.params, "'use strict;'; return " + str);
        // manually bind params
        let funcWithParam = this.params.reduce((f, p) => f.bind(undefined, this.objs[p]), func);
        return funcWithParam();
    }
    /**
     * Add TJSVM variable
     * @param {String} name Object name
     * @param {Object} obj Initial value, default = {}
     */
    static addObject(name, obj) {
        this.objs[name] = (obj || {});
        this.params.push(name);
    }
    /**
     * Get variable
     * @param {String} name variable
     * @example TJSVM.get('f.voiceBase');
     */
    static get(name) {
        return name
            .split('.')
            .reduce((p, c) => p === undefined ? undefined : p[c], this.objs);
    }
}
TJSVM.Init();
TJSVM.addObject('f');
TJSVM.addObject('sf');
TJSVM.addObject('kag');

window.TJSVM = TJSVM;