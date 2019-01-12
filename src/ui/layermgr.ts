import YZCamera from "./camera";
import YZLayer from "./layer";

export default class YZLayerMgr {
    static layers: {
        [name: string]: YZLayer
    } = {};

    static Init() {
        YZLayer.rootDOM = $("#camera");
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
        if (name === "camera") return YZCamera.GetInstance();
        if (!this.layers[name]) {
            this.layers[name] = new YZLayer(name, files, zindex);
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
