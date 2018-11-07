export default class AsyncTask {
    static Init() {
        this.ctr = 0;
    }

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

    static Cancel() {
        this.ctr++;
    }
}