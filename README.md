## AdLiPo

### Ongoing development for a uBlock-based variant of AdLiPo (v2)

<hr>

### Instructions

#### Building

* clone the repo to your machine with `git clone https://github.com/dhowe/AdLiPo.git`
* clone [uAssests](https://github.com/uBlockOrigin/uAssets) into the same parent folder with  `git clone https://github.com/uBlockOrigin/uAssets.git`
* then enter the AdLiPo folder (`cd AdLiPo`)

##### For Firefox (instructions checked on v95.0):
1. run `tools/make-firefox.sh` (or `sh tools/make-firefox.sh -all`)
2. then, in Firefox open about:debugging from the location bar
3. click 'This Firefox' on the top-left, then click 'Load Temporary Add-on...'
5. in the dialog that appears, navigate to `dist/build/AdLiPo.firefox/` and select the manifest.json file
6. AdLiPo should now be loaded in Firefox (check for the icon in the toolbar)

##### For Chromium (instructions checked on Chrome v96.0):
1. run `tools/make-chromium.sh` (or `sh tools/make-chromium.sh`)
2. then, in the browser open chrome://extensions from the location bar
3. click 'Load unpacked' on the top-left
4. in the dialog that appears, navigate to `dist/build/` and select the `AdLiPo.chromium` folder
5. AdLiPo should now be loaded in the browser (check for the icon in the toolbar)

<br> 

#### Testing

After loading the extension:

1. Visit `test/test.html` and make sure all divs on the page are hidden, then disable the extension and re-enable it, then make sure each rectangle is the same size as the original div.
2. Visit https://rednoise.org/adntest/simple.html and do the same check.
3. Visit https://hk.yahoo.com and verify that all ads are either hidden or replaced with rectangles. Disable the extension and enable it again, then make sure that more at least 75% of the ads are replaced. Pay attention to ads inserted in the news lists (when testing this from Asia, make sure the filter list `AdGuard Chinese` is enabled).
