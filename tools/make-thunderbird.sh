#!/usr/bin/env bash
#
# This script assumes a linux environment

echo "*** AdLiPo.thunderbird: Creating web store package"

BLDIR=dist/build
DES="$BLDIR"/AdLiPo.thunderbird
rm -rf $DES
mkdir -p $DES

echo "*** AdLiPo.thunderbird: copying common files"
bash ./tools/copy-common-files.sh  $DES

cp -R $DES/_locales/nb                 $DES/_locales/no

cp platform/thunderbird/manifest.json  $DES/
cp platform/firefox/webext.js          $DES/js/
cp platform/firefox/vapi-webrequest.js $DES/js/

# Firefox/webext-specific
rm $DES/img/icon_128.png

echo "*** AdLiPo.thunderbird: Generating meta..."
python tools/make-firefox-meta.py $DES/

if [ "$1" = all ]; then
    echo "*** AdLiPo.thunderbird: Creating package..."
    pushd $DES > /dev/null
    zip ../$(basename $DES).xpi -qr *
    popd > /dev/null
elif [ -n "$1" ]; then
    echo "*** AdLiPo.thunderbird: Creating versioned package..."
    pushd $DES > /dev/null
    zip ../$(basename $DES).xpi -qr *
    popd > /dev/null
    mv "$BLDIR"/AdLiPo.thunderbird.xpi "$BLDIR"/AdLiPo_"$1".thunderbird.xpi
fi

echo "*** AdLiPo.thunderbird: Package done."
