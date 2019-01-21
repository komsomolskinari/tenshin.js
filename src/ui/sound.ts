import { getElem, createElem } from "../utils/dom";

export default class SoundUI {
    private static basefd: HTMLElement;
    private static channels: {
        [name: string]: SoundUI
    } = {};
    static Init() {
        this.basefd = getElem("#audiodiv");
        this.channels.bgm = new SoundUI("bgm");
        this.channels.bgm.fd.loop = true;
    }

    static Create(name: string) {
        this.channels[name] = new SoundUI(name);
        return this.channels[name];
    }

    static Get(name: string) {
        if (this.channels[name] === undefined) return this.Create(name);
        return this.channels[name];
    }

    static Delete(name: string) {
        this.channels[name].Remove();
        delete this.channels[name];
    }

    name: string;
    fd: HTMLAudioElement;

    event: SoundEvent[] = [];

    lastTick: number; // last timeline tick
    constructor(name: string) {
        this.name = name;
        this.fd = createElem("audio", `snd_${name}`) as HTMLAudioElement;
        SoundUI.basefd.appendChild(this.fd);

        this.fd.addEventListener("timeupdate", () => {
            const cur = this.fd.currentTime;
            if (this.lastTick !== undefined) {
                // calculate event to exec
                this.event
                    .map(ev => ev.time < cur && ev.time > this.lastTick)
                    .forEach(ev => console.debug(ev));
            }
            console.debug("tick!");
            this.lastTick = cur;
        });
    }

    Src(url: string) {
        this.fd.src = url;
    }

    Play() {
        this.fd.play().catch(() => undefined);
    }

    Stop() {
        this.fd.pause();
    }

    Remove() {
        this.fd.remove();
    }
}