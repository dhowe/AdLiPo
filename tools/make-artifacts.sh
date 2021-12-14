#!/usr/bin/env bash
#
# This script assumes a linux environment


BLDIR=dist/build
DES="$BLDIR"/AdLiPo
ARTS=artifacts

VERSION=`cat dist/version`
echo "*** AdLiPo: Creating v$VERSION artifacts..."


exit #tmp

rm -rf $ARTS
mkdir -p $ARTS

./tools/make-firefox.sh
./tools/make-chromium.sh

echo "*** AdLiPo: Copying files to $ARTS

open $ARTS
