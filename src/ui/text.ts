import TextHTML from "../utils/texthtml";
import { getElem } from "../utils/util";

export default class YZText {
    static nameCh: HTMLElement;
    static textCh: HTMLElement;
    static Init() {
        this.nameCh = getElem("#charname");
        this.textCh = getElem("#chartxt");
    }

    static Print(text: string, display: string) {
        display = display || "";
        this.nameCh.innerHTML = display;
        this.textCh.innerHTML = TextHTML(text);
    }
}
