#!/usr/bin/env bash
#
# This script assumes a linux environment

echo "*** AdLiPo.chromium: Creating web store package"

DES=dist/build/AdLiPo.chromium
rm -rf $DES
mkdir -p $DES

echo "*** AdLiPo.chromium: copying common files"
bash ./tools/copy-common-files.sh  $DES

# Chrome store-specific
cp -R $DES/_locales/nb $DES/_locales/no

echo "*** AdLiPo.chromium: Generating meta..."
python tools/make-chromium-meta.py $DES/

if [ "$1" = all ]; then
    echo "*** AdLiPo.chromium: Creating plain package..."
    pushd $(dirname $DES/) > /dev/null
    zip AdLiPo.chromium.zip -qr $(basename $DES/)/*
    popd > /dev/null
elif [ -n "$1" ]; then
    echo "*** AdLiPo.chromium: Creating versioned package..."
    pushd $(dirname $DES/) > /dev/null
    zip AdLiPo_"$1".chromium.zip -qr $(basename $DES/)/*
    popd > /dev/null
fi

echo "*** AdLiPo.chromium: Package done."
