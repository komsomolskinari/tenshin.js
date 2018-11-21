#!/usr/bin/env python3

import os, sys, stat, json

def gen_dir(path):
    os.chdir(path)
    ret = []
    ds = os.listdir()
    for d in ds:
        if d[0] == '.':
            continue
        j = {"name":d,"type":"file"}
        if os.path.isdir(d):
            j["type"] = "directory"
            j["content"] = gen_dir(d)
        ret.append(j)
    os.chdir('../')
    return ret
t = gen_dir(sys.argv[1])
ret = [{"type":"directory","name": ".","contents":t},
{"type":"report","directories":0,"files":0}]

print(json.dumps(ret))