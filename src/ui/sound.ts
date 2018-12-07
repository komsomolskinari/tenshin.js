import FilePath from '../utils/filepath'

export default class YZSound {
    static channels: {
        [name: string]: JQuery<HTMLElement>
    };

    static Init() {
        this.channels = {
            voice: $('#voice'),
            se: $('#se'),
            bgm: $('#bgm')
        }
    }

    static BGM(cmd: KSLine) {
        let fadetime = 0;
        if (cmd.param.time) fadetime = cmd.param.time as number / 1000;

        if (cmd.option.includes('stop')) {
            this.AudioChannelCtl('bgm', null, { '-1': ['pause', 0, fadetime] })
        }
        else {
            if (!cmd.param.storage) return;
            let realbgm = (cmd.param.storage as string).replace(/bgm/i, 'BGM');
            // TODO: generate loop info
            let ctl = { '-1': ['start', fadetime] };
            this.AudioChannelCtl('bgm', realbgm, ctl)
        }
    }

    /**
     * Output voice
     * @param {String} src Source
     */
    static Voice(src: string) {
        let ctl = { '-1': ['start', 0] }
        this.AudioChannelCtl('voice', src, ctl)
    }

    // playctl format: key is time(sec), -1 means immediately
    // once a cmd is set, it will always exist, until different aname is set
    /* {
        -1:['start',0], start: start play (if not stopped) with arg1 fadein
        700:['seek',1000], seek: Jump to arg1
        900:['volume',0.7,0] volume: Change volume to arg1 with arg2 fade
        2000:['pause',0,2], pause: pause arg1 sec with arg2 fadeout, arg1 = 0 means infinite
    }*/
    /**
     * 
     * @param {String} channel Channel name
     * @param {String} aname Audio name, if null, not change
     * @param {*} playctl Play Control
     */
    static AudioChannelCtl(channel: string, aname: string, playctl: any) {
        let ch = this.channels[channel];
        let s = ch.attr('src');
        let asrc = null;
        if (aname != null) {
            asrc = FilePath.findMedia(aname, 'audio');
        }
        if (asrc != s) {
            ch.attr('src', asrc);
            ch.unbind('timeupdate');
        }
        for (const key in playctl) {
            if (playctl.hasOwnProperty(key)) {
                const element = playctl[key];
                let f = () => { };
                const elm: HTMLAudioElement = ch.get(0) as HTMLAudioElement;
                switch (element[0]) {
                    case 'start':
                        f = () => {
                            elm.play().catch(e => { });
                        }
                        break;
                    case 'pause':
                        f = () => {
                            elm.pause();
                        }
                        break;
                    case 'volume':
                        f = () => {
                            elm.volume = element[1];
                        }
                }
                if (parseInt(key) == -1) {
                    f();
                }
            }
        }
    }
}