export default class AsyncTask {
    static Init() {
        this.ctr = 0;
    }

    /**
     * Add a 'cancellable' function
     * @param {Function} func function to execute
     * @param {Object} param function parameter
     * @param {Number} timeout function execute timeout 
     */
    static Add(func, param, timeout) {
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