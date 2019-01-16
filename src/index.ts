/// <reference path="config.d.ts" />

import Init from "./init";
import KSVM from "./ksvm";
import ObjectMapper from "./objectmapper";
import KSParser from "./parser/ksparser";
import TJSON from "./parser/tjson";
import LayerChara from "./runtime/layer/chara";
import TJSVM from "./tjsvm";
import { getElem } from "./utils/dom";
import FilePath from "./utils/filepath";

async function LoadVMData() {
    const scriptLoadSeq = Config.Boot.InitialScripts;
    const envinit = await FilePath.read(Config.Boot.EnvInitFile);
    ObjectMapper.LoadObject(TJSON.parse(envinit));
    await Promise.all(scriptLoadSeq.map(s =>
        (async () =>
            KSVM.AddScript(
                s.split(".")[0],
                KSParser.parse(await FilePath.read(s))
            )
        )()
    ));
    // TODO: too many async task in new Character()
    // Slow it down? Or let other task run first?
    LayerChara.Init();
    return;
}

Object.keys(Config.Boot.TJSVariable)
    .forEach(k => TJSVM.addObject(k, Config.Boot.TJSVariable[k]));

document.addEventListener("DOMContentLoaded", async () => {
    await Init();
    await LoadVMData();
    getElem("#button_next").addEventListener("click", () => KSVM.Next());
    getElem("#button_next_multi").addEventListener("click", async () => {
        const count = parseInt((getElem("#input_stepcount") as HTMLInputElement).value);
        for (let t = 0; t < count; t++) await KSVM.Next();
    });
    KSVM.RunFrom(Config.Boot.EntryTag);
    KSVM.Next();
    // TODO: let vm cache module load other script
    await Promise.all(
        Object.keys(FilePath.ls(Config.Boot.ScenarioPath))
            .map(s =>
                (async () =>
                    KSVM.AddScript(
                        s.split(".")[0],
                        KSParser.parse(await FilePath.read(s))
                    )
                )()
            ));
    console.debug("cache ok");
});
