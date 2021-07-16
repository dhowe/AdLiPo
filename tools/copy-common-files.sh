#!/usr/bin/env bash
#
# This script assumes a linux environment

DES=$1

bash ./tools/make-assets.sh        $DES

cp -R src/css                      $DES/
cp -R src/img                      $DES/
cp -R src/js                       $DES/
cp -R src/lib                      $DES/
cp -R src/web_accessible_resources $DES/
# cp -R src/_locales               $DES/

cp src/*.html                      $DES/
cp platform/chromium/*.js          $DES/js/
cp platform/chromium/*.html        $DES/
cp platform/chromium/*.json        $DES/
cp LICENSE.txt                     $DES/

# AdLiPo
cp -R AdLiPo/_locales              $DES/
cp -R AdLiPo/src/js                $DES/
cp -R AdLiPo/lib/*.js              $DES/js/
cp -R AdLiPo/AdLiPoImage           $DES
yes | cp AdLiPo/*.html             $DES/