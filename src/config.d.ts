declare enum ConfigTreeMode {
    nginx_json = "nginx-json",
    nginx_xml = "nginx-xml",
    nginx_html = "nginx-html",
    apache = "apache",
    iis = "iis",
    lighttpd = "lighttpd",
    hfs = "hfs",
    json = "json",
    http_server = "http-server",
}

declare var Config: {
    File: {
        Root: string,
        TreeMode: ConfigTreeMode,
        TreePath: string
    },
    Boot: {
        InitialScripts: Array<string>,
        EntryTag: string,
        EnvInitFile: string,
        TJSVariable: { [prop: string]: any },
        OverrideMacros: Array<string>,
        ScenarioPath: string,
    },
    Display: {
        WindowSize: [number, number],
        OPFile: string,
        CGPath: string,
        CGDiffFile: string,
        CharacterPath: string,
    },
    Debug?: {
        DebugMode?: boolean
    }
}
