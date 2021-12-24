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
# cp src/*.html                      $DES/

cp ChangedFiles/platform/common/*.js          $DES/js/
# cp ChangedFiles/platform/common/*.html        $DES/
cp ChangedFiles/platform/common/*.json        $DES/
# cp LICENSE.txt                     $DES/

# AdLiPo
cp -R ChangedFiles/_locales              $DES/
yes | cp -R ChangedFiles/src/js          $DES/
cp -R ChangedFiles/lib/*.js              $DES/js/
cp -R ChangedFiles/AdLiPoImage           $DES
yes | cp ChangedFiles/src/*.html             $DES/
