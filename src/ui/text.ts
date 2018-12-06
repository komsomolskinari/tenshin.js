import TextHTML from "../utils/texthtml";

export default class YZText {
    static Init() {
        this.nameCh = $('#charname');
        this.textCh = $('#chartxt');
    }

    static Print(text, display) {
        this.nameCh.html(display);
        this.textCh.html(TextHTML(text));
    }
}