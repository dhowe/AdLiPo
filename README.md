## AdLiPo

### A uBlock-based version of AdLiPo (under development)

<br>

Note: uBlock Origin is included as a submodule (rather than via forking)

<hr>

### Instructions for building/testing

#### Buliding

1. clone the repo to your machine with `git clone https://github.com/dhowe/AdLiPo.git`
2. clone [uAssests](https://github.com/uBlockOrigin/uAssets) into the same parent folder with  `git clone https://github.com/uBlockOrigin/uAssets.git`
2. enter the AdLiPo floder (`cd AdLiPo`)

For Firefox, run `tools/make-firefox.sh` (`sh tools/make-firefox.sh -all`), then load the `firefox.xpi` file into firefox in `dist/build`.

For Chromium: run `tools/make-chromium.sh` (`sh tools/make-chromium.sh`),
then load the unpack extension into Chromium browsers.

#### test

After loading the extension into your browsers:

1. visit `test/test.html` and make sure all the divs in the page are blocked, then disable the extension and enable it again, make sure the rectangles are in the same sizes as the original divs.
2. visit https://rednoise.org/adntest/simple.html and check for the same items
3. visit https://hk.yahoo.com and check if all the ads are hidden or replaced with rectangles. Disable the extension and enable it again, make sure that more than 75% of the ads are replaced. Should pay attention to ads inserted in the news lists. When testing this, make sure filter list `AdGuard Chinese ` is enabled. (especially in Chrome)