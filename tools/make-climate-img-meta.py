#!/usr/bin/env python3

import os
import json
import re
import sys


def scan_dir_r(dir, regex):
    subfolders = []
    meta_out = {}

    for f in os.scandir(dir):
        subfolders.append(f.path)

    for d in list(subfolders):
        for sf in os.scandir(d):
            if sf.is_file:
                if re.match(regex, sf.name):
                    if os.path.basename(os.path.dirname(sf.path)) in meta_out:
                        meta_out[os.path.basename(os.path.dirname(sf.path))].append(sf.name)
                    else:
                        meta_out[os.path.basename(os.path.dirname(sf.path))] = []
                        meta_out[os.path.basename(os.path.dirname(sf.path))].append(sf.name)
    
    return json.dumps(meta_out,sort_keys=True, indent=2)

if len(sys.argv) == 1 or not sys.argv[1]:
    raise SystemExit('Climate images path missing')

if not sys.argv[2]:
    raise SystemExit('Build target path missing')

climate_img_folder = os.path.abspath(sys.argv[1])
target_folder = os.path.abspath(sys.argv[2])
template_path = os.path.abspath(os.path.join(target_folder, "js/injectTemplate.js"))

validation_re = re.compile(r"([A-Za-z_0-9-]+\.(png|jpg))")
img_meta = scan_dir_r(climate_img_folder,validation_re)
replace_re = re.compile(r"\"TO_BE_REPLACED_BY_GENERATED_META\"")

with open(template_path, "r+") as tf:
    contents = tf.read()
    contents = re.sub(replace_re, img_meta, contents)
    tf.seek(0)
    tf.write(contents)
    tf.truncate()






    



