export default class AsyncTask {
    private static ctr = 0;
    /**
     * Add a 'cancellable' function
     * @param {Function} func function to execute
     * @param {Object} param function parameter
     * @param {Number} timeout function execute timeout 
     */
    static Add(func: (p: any) => any, param: any, timeout: number) {
        let tmp = this.ctr;
        setTimeout(() => {
            if (tmp != this.CTR()) {
                console.debug('cancel task');
                return;
            }
            func(param);
        }, timeout);
    }

    static CTR() {
        return this.ctr;
    }

    /**
     * Cancel all 'async' function
     */
    static Cancel() {
        this.ctr++;
    }
}