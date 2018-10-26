#!/usr/bin/env python3

import os, sys, stat, json

def gen_dir(path):
    os.chdir(path)
    ret = []
    ds = os.listdir()
    for d in ds:
        if d[0] == '.':
            continue
        j = {"name":d,"type":"file","sub":None}
        if os.path.isdir(d):
            j["type"] = "directory"
            j["sub"] = gen_dir(d)
        ret.append(j)
    os.chdir('../')
    return ret
t = gen_dir(sys.argv[1])
print(json.dumps(t,indent=4))