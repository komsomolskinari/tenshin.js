import FilePath from '../utils/filepath'

export default class YZSound {
    static Init() {
        this.bgmFormat = '.ogg'
        this.voiceFormat = '.ogg'
        this.channels = {
            voice: $('#voice'),
            se: $('#se'),
            bgm: $('#bgm')
        }
        this.charsq = {}
    }

    static BGM(cmd) {
        let fadetime = 0;
        if (cmd.param.time) fadetime = cmd.param.time / 1000;

        if (cmd.option.includes('stop')) {
            this.AudioChannelCtl('bgm', null, { '-1': ['pause', 0, fadetime] })
        }
        else {
            if (!cmd.param.storage) return;
            let realbgm = cmd.param.storage.replace(/bgm/i, 'BGM') + this.bgmFormat;
            // TODO: generate loop info
            let ctl = { '-1': ['start', fadetime] };
            this.AudioChannelCtl('bgm', realbgm, ctl)
        }
    }

    /**
     * Output voice
     * @param {String} char Character
     * @param {String} base Voice base name, from runtime variable
     * @param {String} sequence Sequence id
     */
    static Voice(char, base, sequence) {
        if (!this.charsq[char]) {
            this.charsq[char] = 1;
        }
        let seq = 0;
        if (sequence !== undefined) {
            let intseq = parseInt(sequence);
            // string seq, just use one time
            if (isNaN(intseq)) {
                seq = sequence;
            }
            // number seq, save it
            else {
                this.charsq[char] = intseq;
                seq = intseq;
            }
        }
        // no seq info, load one
        else {
            seq = this.charsq[char];
            this.charsq[char]++;
        }
        // TODO: Global Variable Dependecy
        let fmt = window.Mapper.GetNameInfo(char).voicefile;
        if (fmt == null) return null;
        if (parseInt(seq)) {
            let seqtxt = String(seq).padStart(3, '0')
            fmt = fmt.replace('%s', base);
            fmt = fmt.replace('%03d', seqtxt);
        }
        else {
        }
        fmt = fmt.replace(/\.[a-z0-9]{2,5}$/i, '') + this.voiceFormat;
        let ctl = { '-1': ['start', 0] }
        this.AudioChannelCtl('voice', fmt, ctl)
        return fmt;
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
    static AudioChannelCtl(channel, aname, playctl) {
        console.log(arguments);
        let ch = this.channels[channel];
        let s = ch.attr('src');
        let asrc = null;
        if (aname != null) {
            asrc = FilePath.find(aname);
        }
        if (asrc != s) {
            ch.attr('src', asrc);
            ch.unbind('timeupdate');
        }
        for (const key in playctl) {
            if (playctl.hasOwnProperty(key)) {
                const element = playctl[key];

            }
        }
    }
}
YZSound.Init();