declare enum ConfigTreeMode {
    nginx_json = "nginx-json",
    nginx_xml = "nginx-xml",
    nginx_html = "nginx-html",
    apache = "apache",
    iis = "iis",
    lighttpd = "lighttpd",
    hfs = "hfs",
    json = "json"
}

declare var Config: {
    File: {
        // String: file tree root, add prefix to all ajax
        Root: string,
        // Enum: nginx-json, nginx-xml, nginx-html, apache, iis, lighttpd, hfs, json
        //      - json：use static json file, in tree -J format
        TreeMode: ConfigTreeMode,
        // String: where to start read tree information
        //      if use json treemode, the path to index file
        TreePath: string
    },
    Boot: {
        // Array <String>: Scripts needed to start VM
        InitialScripts: Array<string>,
        // String: Which tag to start VM
        EntryTag: string,
        // String:
        EnvInitFile: string,
        // Object: TJSVM's 'Global'
        TJSVariable: { [prop: string]: any },
        // Array<String>: Macros which use 'native' implement
        OverrideMacros: Array<string>,
        // String:
        ScenarioPath: string,
    },
    Display: {
        // [Integer, Integer]: Original game window size
        //      edit this WON'T modify the size in browser
        WindowSize: [number, number],
        // String:
        OPFile: string,
        // String:
        CGPath: string,
        // String:
        CGDiffFile: string,
        // String:
        CharacterPath: string,
    },
    Debug?: {
        DebugMode?: boolean
    }
}
