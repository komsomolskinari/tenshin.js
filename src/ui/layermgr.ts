import { getElem } from "../utils/dom";
import CameraUI from "./camera";
import LayerUI from "./layer";

export default class LayerUIMgr {
    static layers: {
        [name: string]: LayerUI
    } = {};

    static Init() {
        LayerUI.rootDOM = getElem("#camera");
    }

    static Get(name: string) {
        return this.layers[name];
    }
    /**
     * Set a layer (new or existed)
     * @param name
     * @param files
     */
    static Set(name: string, files: LayerInfo[], zindex?: number) {
        if (name === "camera") return CameraUI.GetInstance();
        if (!this.layers[name]) {
            this.layers[name] = new LayerUI(name, files, zindex);
        }
        else {
            if (files && files.length > 0) this.layers[name].SetSubLayer(files);
        }
        return this.layers[name];
    }

    static Unset(name: string) {
        const t = this.layers[name];
        if (!t) return;
        t.Delete();
        delete this.layers[name];
    }
}
