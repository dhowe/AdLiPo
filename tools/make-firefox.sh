#!/usr/bin/env bash
#
# This script assumes a linux environment

echo "*** AdLiPo.firefox: Creating web store package"

BLDIR=dist/build
DES="$BLDIR"/AdLiPo.firefox
rm -rf $DES
mkdir -p $DES

echo "*** AdLiPo.firefox: copying common files"
bash ./tools/copy-common-files.sh  $DES

cp -R $DES/_locales/nb                 $DES/_locales/no

cp platform/firefox/manifest.json      $DES/
cp platform/firefox/webext.js          $DES/js/
cp platform/firefox/vapi-webrequest.js $DES/js/

# Firefox/webext-specific
rm $DES/img/icon_128.png

echo "*** AdLiPo.firefox: Generating meta..."
python tools/make-firefox-meta.py $DES/

if [ "$1" = all ]; then
    echo "*** AdLiPo.firefox: Creating package..."
    pushd $DES > /dev/null
    zip ../$(basename $DES).xpi -qr *
    popd > /dev/null
elif [ -n "$1" ]; then
    echo "*** AdLiPo.firefox: Creating versioned package..."
    pushd $DES > /dev/null
    zip ../$(basename $DES).xpi -qr *
    popd > /dev/null
    mv "$BLDIR"/AdLiPo.firefox.xpi "$BLDIR"/AdLiPo_"$1".firefox.xpi
fi

echo "*** AdLiPo.firefox: Package done."
