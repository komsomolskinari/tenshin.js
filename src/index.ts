/// <reference path="config.d.ts" />

import Init from "./init";
import KSVM from "./ksvm";
import ObjectMapper from "./objectmapper";
import Character from "./runtime/character";
import TJSVM from "./tjsvm";
import FilePath from "./utils/filepath";
import KSParser from "./utils/ksparser";
import TJSON from "./utils/tjson";

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
    Object.keys(ObjectMapper.innerobj.characters)
        .forEach(c => new Character(c));
    return;
}

Object.keys(Config.Boot.TJSVariable)
    .forEach(k => TJSVM.addObject(k, Config.Boot.TJSVariable[k]));

$(document).ready(async () => {
    await Init();
    await LoadVMData();
    $(document).click(() => KSVM.Next());
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