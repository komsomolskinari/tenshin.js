export enum VMMode {
    Step,   // stop per step
    Text,   // stop per text
    Auto,   // stop per text, wait all async operation, and continue
    Quick,  // stop per text, continue after 20 ms?
    Select, // stop when jump occured, shutdown ui
}
export enum KAGConst {
    Both = "KAGEnvImage.BOTH",
    BU = "KAGEnvImage.BU",
    Clear = "KAGEnvImage.CLEAR",
    Face = "KAGEnvImage.FACE",
    Invisible = "KAGEnvImage.INVISIBLE",
    DispPosition = "KAGEnvironment.DISPPOSITION",
    XPosition = "KAGEnvironment.XPOSITION",
    Level = "KAGEnvironment.LEVEL"
}
