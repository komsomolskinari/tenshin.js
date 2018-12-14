// 本文件支持Unicode
window.Config = {
    Boot: {
        // String: Which tag to start VM
        EntryTag: "start",
        // String:
        EnvInitFile: "envinit.tjs",
        // Array <String>: Scripts needed to start VM
        InitialScripts: ["start.ks", "１.ks", "２.ks"],
        // Array<String>: Macros which use 'native' implement
        OverrideMacros: ["swmovie", "edmovie", "day_full", "initscene"],
        // String:
        ScenarioPath: "scenario",
        // Object: TJSVM's 'Global'
        TJSVariable: {
            f: {
                aoi_flag: 0,
                mah_flag: 0,
                rur_flag: 0,
                sak_flag: 0,
                san_flag: 0,
                yuk_flag: 0,
            },
            kag: {},
            sf: {
                aoi_clear: false,
                mahiro_clear: false,
                ruri_clear: false,
                sakuya_clear: false,
                sana_clear: false,
                yukari_clear: false,
            },
        },
    },
    Debug: {
        DebugMode: true,
    },
    Display: {
        // String:
        CGDiffFile: "evdiff.csv",
        // String:
        CGPath: "evimage",
        // String:
        CharacterPath: "fgimage",
        // String:
        OPFile: "ＯＰ",
        // [Integer, Integer]: Original game window size
        //      edit this WON'T modify the size in browser
        WindowSize: [1280, 720],
    },
    File: {
        // String: file tree root, add prefix to all ajax
        Root: "game/",
        // Enum: nginx-json, nginx-xml, nginx-html, apache, iis, lighttpd, hfs, json
        //      - http-server: npm's http-server
        //      - json：use static json file, in tree -J format
        TreeMode: "http-server",
        // String: where to start read tree information
        //      if use json treemode, the path to index file
        TreePath: "game/",
    },
};
