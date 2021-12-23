#!/usr/bin/env bash
#
# This script assumes a linux environment

# https://github.com/uBlockOrigin/uBlock-issues/issues/217
set -e

echo "*** AdLiPo.webext: Creating web store package"

DES=dist/build/AdLiPo.webext
rm -rf $DES
mkdir -p $DES

echo "*** AdLiPo.webext: copying common files"
bash ./tools/copy-common-files.sh  $DES

cp -R $DES/_locales/nb                  $DES/_locales/no

cp ChangedFiles/platform/webext/manifest.json        $DES/

# https://github.com/uBlockOrigin/uBlock-issues/issues/407
echo "*** AdLiPo.webext: concatenating vapi-webrequest.js"
cat ChangedFiles/platform/chromium/vapi-webrequest.js > /tmp/vapi-webrequest.js
grep -v "^'use strict';$" ChangedFiles/platform/firefox/vapi-webrequest.js >> /tmp/vapi-webrequest.js
mv /tmp/vapi-webrequest.js $DES/js/vapi-webrequest.js

echo "*** AdLiPo.webext: Generating meta..."
python3 tools/make-webext-meta.py $DES/

if [ "$1" = all ]; then
    echo "*** AdLiPo.webext: Creating package..."
    pushd $DES > /dev/null
    zip ../$(basename $DES).xpi -qr *
    popd > /dev/null
elif [ -n "$1" ]; then
    echo "*** AdLiPo.webext: Creating versioned package..."
    pushd $DES > /dev/null
    zip ../$(basename $DES).xpi -qr * -O ../AdLiPo_"$1".webext.xpi
    popd > /dev/null
fi

echo "*** AdLiPo.webext: Package done."
