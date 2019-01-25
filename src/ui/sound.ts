import DelayExec from "../runtime/delayexec";
import { createElem, getElem, getElems } from "../utils/dom";

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

    static Create(name: string, type?: string) {
        this.channels[name] = new SoundUI(name, type);
        return this.channels[name];
    }

    static Get(name: string, type?: string) {
        if (this.channels[name] === undefined) return this.Create(name, type);
        return this.channels[name];
    }

    static Delete(name: string) {
        this.channels[name].Remove();
        delete this.channels[name];
    }

    name: string;
    fd: HTMLAudioElement;
    type: string;
    event: SoundEvent[] = [];

    lastTick: number; // last timeline tick
    constructor(name: string, type?: string) {
        this.name = name;
        this.type = type;
        this.fd = createElem("audio", `snd_${name}`, type ? [`sndtype_${type}`] : undefined) as HTMLAudioElement;
        SoundUI.basefd.appendChild(this.fd);

        this.fd.addEventListener("timeupdate", () => {
            const cur = this.fd.currentTime;
            let jumped = false;
            if (this.lastTick !== undefined) {
                // calculate event to exec
                this.event
                    .filter(ev => ev.time < cur && ev.time > this.lastTick)
                    .forEach(ev => {
                        switch (ev.type) {
                            case "link":
                                // TODO: set lastTick to undefined
                                // avoid multiple jump
                                if (jumped) break;
                                this.fd.currentTime = ev.data as number;
                                jumped = true;
                                break;
                            case "label":
                                DelayExec.RecieveLabel(ev.data as string);
                                break;
                        }
                    });
            }
            this.lastTick = cur;
        });
    }

    Src(url: string) {
        this.fd.currentTime = 0;
        this.fd.src = url;
        this.event = [];
    }

    Play() {
        if (this.type === "voice") {
            getElems(`.sndtype_${this.type}`)
                .forEach((elm: HTMLAudioElement) => elm.pause());
        }
        this.fd.play().catch(() => undefined);
    }

    Stop() {
        this.fd.pause();
    }

    Remove() {
        this.fd.remove();
    }

    Link(from: number, to: number) {
        this.event.push({
            time: from,
            type: "link",
            data: to,
        } as SoundEvent);
    }

    Label(time: number, name: string) {
        this.event.push({
            time,
            type: "label",
            data: name,
        } as SoundEvent);
    }

    StartAt(tag: string) {
        this.fd.currentTime = this.event.filter(t => t.data === tag)[0].time;
    }
}