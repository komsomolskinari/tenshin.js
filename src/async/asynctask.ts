export default class AsyncTask {
    private static ctr = 0;
    /**
     * Add a 'cancellable' function
     * @param func function to execute
     * @param param function parameter
     * @param timeout function execute timeout
     */
    static Add(func: (p: any) => any, param: any, timeout: number) {
        const tmp = this.ctr;
        setTimeout(() => {
            if (tmp !== this.CTR()) {
                console.debug("cancel task");
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