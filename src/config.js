export default {
    File: {
        Root: 'game/',
        TreeMode: 'nginx-json',
        TreePath: 'game/'
    },
    Boot: {
        InitialScripts: ['start.ks', '１.ks', '２.ks'],
        EntryTag: 'start',
        EnvInitFile: 'envinit.tjs',
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
        ScenarioPath: 'scenario',
    },
    Display: {
        WindowSize: [1280, 720],
        OPFile: 'ＯＰ',
        CGPath: 'evimage',
        CGDiffFile: 'evdiff.csv',
        CharacterPath: 'fgimage',
    },
    Debug: {
        DebugMode: true
    }
}