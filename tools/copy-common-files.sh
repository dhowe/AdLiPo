#!/usr/bin/env bash
#
# This script assumes a linux environment

DES=$1

bash ./tools/make-assets.sh        $DES

cp -R ublockOrigin/src/css                      $DES/
cp -R ublockOrigin/src/img                      $DES/
cp -R ublockOrigin/src/js                       $DES/
cp -R ublockOrigin/src/lib                      $DES/
cp -R ublockOrigin/src/web_accessible_resources $DES/
# cp -R ublockOrigin/src/_locales               $DES/
# cp ublockOrigin/src/*.html                    $DES/

cp platform/common/*.js          $DES/js/
# cp platform/common/*.html        $DES/
cp platform/common/*.json        $DES/
# cp LICENSE.txt                     $DES/

# AdLiPo
cp -R _locales                  $DES/
yes | cp -R src/js                 $DES/
cp -R lib/*.js                  $DES/js/
cp -R image                     $DES
yes | cp -R src/*.html             $DES/

# Climate 
cp -R climate/images/*          $DES/web_accessible_resources
