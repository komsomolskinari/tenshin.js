class PLTask {
    constructor(name, func, resolve, reject, require, retry) {
        this.name = name;
        this.func = func;
        this.resolve = resolve;
        this.reject = reject;
        this.require = require || [];
        this.retry = retry || 0;
    }
    async Exec() {

    }
}
const HIGH = 0;
const LOW = 1;
const MAX_CONCURRENT = 5;
export default class Preloader {
    static Init() {
        // key: taskname, value: task object
        this.tasks = {};
        // high/low priority queue
        this.queue = [[], []];
        // double buffer, make it 'thread safe'
        this.buf = [[], []];

        this.finished = [];
    }

    static IsQueueEmpty(hl) {
        if (hl !== undefined) return this.queue[hl].length == 0;
        return (this.queue[0].length == 0) && (this.queue[1].length == 0);
    }

    static QueueLoad() {
        this.queue[HIGH] = this.queue[HIGH].concat(this.buf[HIGH]);
        this.queue[LOW] = this.queue[LOW].concat(this.buf[LOW]);
    }

    static RemoveTask(name) {

    }

    static async AddTask(name, require, retry, func, priority) {
        // expose internal resolve and reject callback 
        let resolve;
        let reject;
        let pm = new Promise((rslv, rjct) => {
            resolve = rslv;
            reject = rjct;
        });
        this.tasks[name] = new PLTask(name, func, resolve, reject, require, retry);
        // 
        let p = (priority === undefined) ? LOW : priority;


        // return a pending Promise
        return pm;
    }

    static WorkLoop() {
        while (!this.IsQueueEmpty()) {
            this.QueueLoad();
            let q = this.IsQueueEmpty(HIGH) ? this.queue[LOW] : this.queue[HIGH];

            // find higest priority dep
            let pubdep = q.map(u => {
                let req = [u];
                let t;
                do {
                    t = this.tasks[req[0]];
                    req = t.require.filter(r => !this.finished.includes[r]);
                } while (req.length == 0); // all require met and self unmet
                return t.name;
            });
            pubdep = [new Set(pubdep)].slice(0, MAX_CONCURRENT);

            pubdep.forEach((v) => {
                let td = this.tasks[v];
                td.Exec().then(() => this.RemoveTask(v));
            });

        }
    }
}
Preloader.Init();