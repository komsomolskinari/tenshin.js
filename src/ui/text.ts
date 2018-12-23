import TextHTML from "../utils/texthtml";

export default class YZText {
    static nameCh: JQuery<HTMLElement>;
    static textCh: JQuery<HTMLElement>;
    static Init() {
        this.nameCh = $("#charname");
        this.textCh = $("#chartxt");
    }

    static Print(text: string, display: string) {
        display = display || "";
        this.nameCh.html(display);
        this.textCh.html(TextHTML(text));
    }
}
