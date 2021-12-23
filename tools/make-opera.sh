#!/usr/bin/env bash
#
# This script assumes a linux environment

echo "*** AdLiPo.opera: Creating web store package"

DES=dist/build/AdLiPo.opera
rm -rf $DES
mkdir -p $DES

echo "*** AdLiPo.opera: copying common files"
bash ./tools/copy-common-files.sh  $DES

# Opera-specific
cp ChangedFiles/platform/opera/manifest.json $DES/
rm -r $DES/_locales/az
rm -r $DES/_locales/cv
rm -r $DES/_locales/hi
rm -r $DES/_locales/hy
rm -r $DES/_locales/ka
rm -r $DES/_locales/kk
rm -r $DES/_locales/mr
rm -r $DES/_locales/th

# Removing WASM modules until I receive an answer from Opera people: Opera's
# uploader issue an error for hntrie.wasm and this prevents me from
# updating uBO in the Opera store. The modules are unused anyway for
# Chromium- based browsers.
rm $DES/js/wasm/*.wasm
rm $DES/js/wasm/*.wat
rm $DES/lib/lz4/*.wasm
rm $DES/lib/lz4/*.wat
rm $DES/lib/publicsuffixlist/wasm/*.wasm
rm $DES/lib/publicsuffixlist/wasm/*.wat

echo "*** AdLiPo.opera: Generating meta..."
python tools/make-opera-meta.py $DES/

echo "*** AdLiPo.opera: Package done."
