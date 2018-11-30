// 本文件支持Unicode
window.Config = {
    File: {
        // String: file tree root, add prefix to all ajax
        Root: 'game/',
        // Enum: nginx-json, nginx-xml, nginx-html, apache, iis, lighttpd, hfs, json
        //      - json：use static json file, in tree -J format
        TreeMode: 'nginx-json',
        // String: where to start read tree information
        //      if use json treemode, the path to index file
        TreePath: 'game/'
    },
    Boot: {
        // Array <String>: Scripts needed to start VM
        InitialScripts: ['start.ks', '１.ks', '２.ks'],
        // String: Which tag to start VM
        EntryTag: 'start',
        // String:
        EnvInitFile: 'envinit.tjs',
        // Object: TJSVM's 'Global'
        TJSVariable: {
            f: {
                sak_flag: 0,
                rur_flag: 0,
                san_flag: 0,
                aoi_flag: 0,
                mah_flag: 0,
                yuk_flag: 0,
            },
            sf: {
                sakuya_clear: false,
                ruri_clear: false,
                sana_clear: false,
                aoi_clear: false,
                mahiro_clear: false,
                yukari_clear: false,
            },
            kag: {}
        },
        // Array<String>: Macros which use 'native' implement
        OverrideMacros: ['swmovie', 'edmovie', 'day_full', 'initscene'],
        // String:
        ScenarioPath: 'scenario',
    },
    Display: {
        // [Integer, Integer]: Original game window size
        //      edit this WON'T modify the size in browser
        WindowSize: [1280, 720],
        // String:
        OPFile: 'ＯＰ',
        // String:
        CGPath: 'evimage',
        // String:
        CGDiffFile: 'evdiff.csv',
        // String:
        CharacterPath: 'fgimage',
    },
    Debug: {
        DebugMode: true
    }
}