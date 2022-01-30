// [Climate] ---------------------------------------------------
const validIMGFileNameRE = /([A-Za-z_0-9-]+\.(png|jpg))/
const climateImageMeta = {
    "4x3": ["Alexandria_1744x1308.png","donotdepart_3600x2700.png","Mark_Wilson_Getty_Images_1600x1200.png","MICHAEL_NICHOLS_1792x1344.jpg","scmp_1064x738.png","ScottOlson_GettyImages_2240x1680.png","SulimanSallehi_1600x1200.png","Test_960x720.png","Tom_Fisk_Pexels_1920x1440.png","TZORTZINIS_GettyImages_2400x1600.png","WilliamWest_AFP_GettyImages_1600x1200.jpg"],
    "3x4": ["ChrisLeboutillier_2400x3200.png","CINDY_CREIGHTON_SHUTTERSTOCK_.png","Sunsetoned_Pexels_3024x4032.png","Test_720x960.png"],
    "2x1": ["ChristianAslund_Greenpeace_1200x600.png","dreamstime_3400x1700.png","FuturesHub_1000x500.jpg","JaggXaxx_GettyImages_2048x1024.png","Lumppini_Shutterstock_1200x600.png","Mitchell_GettyImages_1600x800.jpg","Shutterstock_3900x1950.png","Test_1000x500.png","UNDP_El_Salvador_1200x600.png","WikipediaCommons_1600x800.png"],
    "1x2": ["Test_500x1000.png","VogueFrance_639x1278.png","Wallpaperaccess_1079x2158.png"],
    "32x9": ["Test_1920x540.png"],
    "9x32": ["Test_540x1920.png"],
    "others": ["AFP_4256x2832.png","BiankaCsenki_Greenpeace_1200x800.png","BrunoKelly_Greenpeace_1200x800.png","ChristianBarga_Greenpeace_1200x800.png","ChristopherFurlong-GettyImages_2175x1450.png","FenEdge_co_uk_1200x800.jpg","Greeenpeace_1200x791.png","Harvard_1200X800.png","JamesBalog1_1120x700.png","JamesBalog2_1120x700.png","JamesBalog3_1120x700.png","JamesBalog4_1120x700.png","JamesBalog5_1120x700.png","JamesBalog6_1120x700.png","JamesBalog7_1120x700.png","JodyJohnson_1440x860.png","KacperPempel_Reuters_1008x567.png","KristiMcCluer-Reuters2_960x640.png","MannieGarcia_Greenpeace_1200x800.png","MarieJacquemin_Greenpeace_1200x800.png","MichaelM_Santiago_GettyImages_3240x2160.png","MikeOsborne_TheNewYorker_960x641.png","PaulSwanstorm_MountainFlyingService_800x500.png","Piqsels_1001x668.png","PrzemystawStefaniak_Greenpeace_800x500.png","UNESCO_3000x2000.png","WarutChinsai_Shutterstock_3000x2000.png"],
}

let climateUsedImageIndex = {
    "4x3":[],
    "3x4":[],
    "2x1":[],
    "1x2":[],
    "32x9": [],
    "9x32":[],
    "others":[]
}
// -------------------------------------------------------------

const selectors = [];
const recentUsed = [];
const perPageLimit = 5;
let observer = undefined;
let rm;
let noOfReplacement = 0;
const onloadList = ["body", "frame", "frameset", "iframe", "img", "link", "script"];
const injectedFont = new FontFace("bench9", "url('https://fonts.gstatic.com/s/benchnine/v9/ahcbv8612zF4jxrwMosbUMl0.woff2') format('woff2')");
const isSelectorValid = ((temElement) =>
    (selector) => {
        try { temElement.querySelector(selector) } catch { return false }
        return true
    })(document.createDocumentFragment())
const findAndProcess = function (dbug = false) {
    try {
        selectors.forEach(s => {
            s = s.trim();
            if (s.length > 0 && isSelectorValid(s)) {
                let doms = document.querySelectorAll(s);
                doms.forEach((d,i) => {
                    if (dbug) {
                        console.log("Processing Element " + i+1 + "/" + doms.length + ":");
                        console.log(d);
                    }
                    try {
                        processCatchedElement(d, dbug);
                    } catch (e) {
                        console.error(e);
                    }
                });
            }
        });
    } catch (e) {
        console.error(e);
    }
}
const checkAndProcess = function (mutations, observer) {
    for(let idx = 0; idx < mutations.length; idx++) {
        const mutation = mutations[idx];
        let checkList;
        if (mutation.type === 'childList') {
            checkList = mutation.addedNodes;
        } else if (mutation.type === 'attributes') {
            if (mutation.target.hasChildNodes()){
                checkChildren(mutation.target);
                continue;
            } else {
                checkList = mutation.target
            }
        }
        if (!checkList) continue;
        
        selectors.forEach(s => {
            s = s.trim();
            if (s.length > 0 && isSelectorValid(s)) {
                if (checkList.length) {
                    for (let i = 0; i < checkList.length; i ++) {
                        if (checkList[i].nodeType === Node.ELEMENT_NODE && checkList[i].matches(s)) {
                            processCatchedElement(checkList[i]);
                        }
                    }
                } else {
                    if (checkList.nodeType === Node.ELEMENT_NODE && checkList.matches(s)) {
                        processCatchedElement(checkList);
                    }
                }
            }
        });
    }
}
const processCatchedElement = function (node, dbug, skipText) {
    //per page limit
    if (noOfReplacement > perPageLimit) {
        if (dbug) console.log(node, "over limit");
        //node.remove();
        node.style.display = "none";
        return;
    }
    //
    if (node === undefined || node === null || !node instanceof HTMLElement) return;
    //check the node
    if (node.offsetWidth === undefined || node.offsetHeight === undefined) {
        if (dbug) console.log(node, "invalid node");
        //node.remove();
        node.style.display = "none";
        return;
    }

    if (node.offsetWidth < 15 || node.offsetHeight < 15) {
        if (dbug) console.log(node, "too small");
        //node.remove();
        node.style.display = "none";
        return;
    }

    if (node.offsetHeight/node.offsetWidth > 20 || node.offsetWidth/node.offsetHeight > 20) {
        if (dbug) console.log(node, "shape too strange");
        //node.remove();
        node.style.display = "none";
        return;
    }

    if (node.classList.contains("AdLiPoReplacedAd")) return; //already changed
    //
    let type = (node.tagName.toLowerCase() === "img" || node.tagName.toLowerCase() === "iframe")
    let oriW = node.offsetWidth;
    // https://github.com/dhowe/AdLiPo/issues/35
    if (oriW > 800) {
        if (dbug) console.log(node, "too big");
        //node.remove();
        node.style.display = "none";
        return;
    }
    let oriH = node.offsetHeight;
    // [Climate]-------------------------------------------------
    let ratio = oriW/oriH;
    if (ratio > 5 || ratio < 0.20){
        if (dbug) console.log(node, "ratio not good for image replacement");
        //node.remove();
        node.style.display = "none";
        return;
    }
    // ----------------------------------------------------------
    if (dbug) console.log("w: " + oriW + " , h: " + oriH);
    //
    let parentNode = node.parentElement;
    let parentW = parentNode.offsetWidth;
    let parentH = parentNode.offsetHeight
    let wPercentage = (oriW/parentW)*100;
    let hPercentage = (oriH/parentH)*100;
    //constrain
    if (wPercentage > 100) wPercentage = 100;
    //
    let injectedBG = document.createElement("div");
    injectedBG.setAttribute("class", "AdLiPoReplacedAd");
    injectedBG.setAttribute("style", "");
    // should inherit some style
    // let oldStyles = window.getComputedStyle(node);
    // Array.from(oldStyles).forEach(s => injectedBG.style.setProperty(s, oldStyles.getPropertyValue(s)))
    // overwrite style:
    // [Climate] injectedBG should be an image ----------------------------
    injectedBG.style.backgroundColor = getColor();
    let catagory;
    if (ratio <=5 && ratio > 3) {
        // ratio 3-5
        catagory = "32x9";
    } else if (ratio > 1.5) {
        // ratio 1.5 - 3
        catagory = "2x1";
    } else if (ratio > 1) {
        // ratio 1 - 1.5
        catagory = "4x3";
    } else if (ratio > 0.667) {
        // 0.667 - 1
        catagory = "3x4";
    } else if (ratio > 0.333) {
        //0.333 - 0.667
        catagory = "1x2";
    } else if (ratio >= 0.20) {
        //0.20 - 0.333
        catagory = "9x32"
    } else {
        if (dbug) console.log(node, "ratio not good for image replacement");
        //node.remove();
        node.style.display = "none";
        return;
    }
    // [Climate]if we dont have images for that ratio, then it should pick one from the nomatch pool
    let useCatagoryPool =  climateImageMeta[catagory].length > 1;
    let randomIdx = useCatagoryPool ? Math.floor(Math.random() * climateImageMeta[catagory].length) : Math.floor(Math.random() * climateImageMeta.others.length);
    // prevent repeat images
    let tries = 0;
    const triesLimit = 99;
    if (useCatagoryPool) {
        while(climateUsedImageIndex[catagory].length < climateImageMeta[catagory].length && climateUsedImageIndex[catagory].includes(randomIdx) && tries < triesLimit){
            randomIdx = Math.floor(Math.random() * climateImageMeta[catagory].length);
            tries ++;
        }
        if (!climateUsedImageIndex[catagory].includes(randomIdx)) {
            climateUsedImageIndex[catagory].push(randomIdx);
        } else {
            useCatagoryPool = false;
            tries = 0;
            randomIdx = Math.floor(Math.random() * climateImageMeta.others.length);
            while(climateUsedImageIndex.others.length < climateImageMeta.others.length && climateUsedImageIndex.others.includes(randomIdx) && tries < triesLimit) {
                randomIdx = Math.floor(Math.random() * climateImageMeta.others.length);
                tries ++;
            }
            if (!climateUsedImageIndex.others.includes(randomIdx)) climateUsedImageIndex.others.push(randomIdx);
        }
    } else {
        while(climateUsedImageIndex.others.length < climateImageMeta.others.length && climateUsedImageIndex.others.includes(randomIdx) && tries < triesLimit) {
            randomIdx = Math.floor(Math.random() * climateImageMeta.others.length);
            tries ++;
        }
        if (!climateUsedImageIndex.others.includes(randomIdx)) climateUsedImageIndex.others.push(randomIdx);
    }

    let internalImageUrl = useCatagoryPool ? "climateImages/" + catagory + "/" + (climateImageMeta[catagory][randomIdx]).trim() : "climateImages/nomatch/" + (climateImageMeta.others[randomIdx]).trim();
    let webUrl = typeof browser === "undefined" ? chrome.runtime.getURL(internalImageUrl) : browser.runtime.getURL(internalImageUrl);
    injectedBG.style.backgroundImage = "url(" + webUrl +")";
    injectedBG.style.backgroundSize = "cover";
    injectedBG.style.backgroundOrigin = "border-box";
    injectedBG.style.backgroundPosition = "center";
    // --------------------------------------------------------------------
    injectedBG.style.border = "0";
    // check the origin ad setting
    let sizeType = checkSizeType(node)
    if (sizeType){
        injectedBG.style.width = oriW + "px";
        injectedBG.style.height = oriH + "px";
    } else {
        injectedBG.style.width = wPercentage + "%";
        //injectedBG.style.height = hPercentage + "%";
    }

    // different moves according to different kinds of elements
    if (node.parentNode.tagName.toLowerCase() === "a") {
        node = node.parentNode; // get rid of links
    }

    if (type) {
        // img & iframe
        injectedBG.style.position = "relative";
        if (dbug) console.log("replacing ", node, "with", injectedBG);
        node.parentNode.replaceChild(injectedBG, node);
        //append text
        if (!skipText) appendText(generateText(oriW, oriH, dbug), injectedBG,  oriW, oriH, sizeType, dbug);
    } else {
        // div, li, etc
        injectedBG.style.position = "relative";
        if (dbug) console.log("replacing ", node, "with", injectedBG);
        node.parentNode.replaceChild(injectedBG, node);
        //append text
        if (!skipText) appendText(generateText(oriW, oriH, dbug), injectedBG, oriW, oriH, sizeType, dbug);
    }

}
const checkChildren = function(target){
    selectors.forEach(s => {
        s = s.trim();
        if (s.length > 0 && isSelectorValid(s)) {
            let doms = target.querySelectorAll(s);
            doms.forEach(d => {
                processCatchedElement(d);
            });
        }
    });
}
const getColor = function() {
    let pool = ['#4484A4', '#A2B6C0', '#889D59', '#CF8D2F', '#C55532'];
    return pool[Math.floor(Math.random() * pool.length)];
}
const appendText = function(textContent, element, widthInPx, heightInPx, type, dbug) {
    // textContent should be a string 
    // element should be a DOM element
    if (textContent === undefined || element === undefined || element === null) {
        console.error("apendText requires string and DOM element");
        return;
    }
    if (typeof textContent !== "string") textContent = textContent.toString();
    if (!(typeof HTMLElement === "object" ? element instanceof HTMLElement : typeof element === "object" && element !== null && element.nodeType === 1 && typeof element.nodeName==="string")) {
        console.error("apendText expects a DOM element, get ", element, "instead");
        return;
    }
    let width = element.style.width;
    let height = element.style.height;
    if (!width || !height || !/^[0-9\\.]+px$/.test(width) || !/^[0-9\\.]+px$/.test(height) ) {
        if (!widthInPx || !heightInPx) {
            console.error("apendText expects fixed width and height");
            return;
        } else {
            width = widthInPx + "px";
            height = heightInPx + "px";
        }
    }
    if (dbug) console.log("cleaning node");
    //clear target
    while(element.firstChild){
        element.removeChild(element.lastChild);
    }
    const font = element.style.fontFamily || 'Bench9'; // a string representing the font name
    const textAlign = element.style.textAlign || 'left'; // a string representing alignment
    const wordBreak = element.style.wordBreak || 'normal'; 
    const lineHeight = element.style.lineHeight || 'normal';
    const padding_LR = Math.min(parseInt(Math.max(2, parseInt(width)/15)), 20); // min padding is 2px max padding is 20px
    const padding_TB = Math.min(parseInt(Math.max(2, parseInt(height)/15)), 20); // min padding is 2px
    // [Climate]--------------------------------------------------------------------------------
    const padding = element.style.padding || `${padding_TB}px ${padding_LR}px`;
    const padddingOutsideFrame = `${padding_TB}px ${Math.min(padding_LR/2, padding_LR - 10)}px`;
    const padddingInsideFrame = `0px ${Math.min(5,padding_LR/2)}px`;
    // -----------------------------------------------------------------------------------------
    if (dbug) console.log("computing font size");
    let temArr = textContent.split(' ');
    temArr[temArr.length - 2] = temArr[temArr.length - 2] + "\u00A0" + temArr[temArr.length - 1];
    temArr.splice(temArr.length - 1, 1);
    textContent = temArr.join(" ");
    //compute fontSize
    const fontSize = computeFontSize(textContent, width, height, font, textAlign, wordBreak, lineHeight, padding, 100, dbug);
    //fontSize to vw
    const fontSizeVw = (parseFloat(fontSize) * 100 / window.innerWidth) + "vw";
    if (dbug) console.log("setting the node");
    //set to the div
    element.style.color = "#fff";
    element.style.fontFamily = font;
    element.style.textAlign = textAlign;
    element.style.fontSize = type ? fontSize :fontSizeVw;
    element.style.fontWeight = "normal";
    element.style.wordBreak = wordBreak;
    element.style.lineHeight = lineHeight;
    //use a inline element to wrap it, so it can be in the middle
    element.style.display = "table";
    const cellElement = document.createElement("div");
    cellElement.classList.add("adLiPoReplacedCellElement");
    cellElement.id = "elementContainingGeneratedTextNo" + noOfReplacement;
    noOfReplacement ++;
    cellElement.style.display = "table-cell";
    cellElement.style.verticalAlign = "middle";
    // [Climate] --------------------------------------------------------------------
    //cellElement.style.padding = padding;
    cellElement.style.padding = padddingOutsideFrame;
    cellElement.style.wordBreak = "normal";
    const innerframe = document.createElement("div");
    innerframe.style.backgroundColor = "hsla(0,0%,0%,0.3)";
    innerframe.style.border = "1px solid white";
    innerframe.style.padding = padddingInsideFrame;
    innerframe.innerText = textContent
    //cellElement.innerText = textContent;
    cellElement.append(innerframe);
    // ------------------------------------------------------------------------------
    try {
        try {
            browser.runtime.sendMessage({
                type: "elementContainingGeneratedText",
                elem: cellElement.id
            }).then(() => { }, (e) => { console.error((e)) });
        } catch (error) {
            const webext = {
                runtime: {
                    sendMessage: promisifyNoFail(chrome.runtime, 'sendMessage')
                }
            }
            webext.runtime.sendMessage({
                type: "elementToReplace",
                targetClassName: "AdLiPoElementToReplace"
            }).then(() => { }, (e) => { console.error((e)) });
        }
    } catch (e) {
        console.error(e);
    }
    //appendInnerText(cellElement, textContent);
    element.appendChild(cellElement);
}

const computeFontSize = function(textContent, width, height, font, textAlign, wordBreak, lineHeight, padding, tryLimit, dbug) {
    // tem element version
    textContent = textContent.trim();
    let css = {}, cssStr;
    const getRealHeight = function() {
        testEl.style.fontSize = guess+ 'px';
        document.body.appendChild(testEl);
        realHeight = testEl.offsetHeight;
        testEl.parentNode.removeChild(testEl);
    }
    const limit = tryLimit || 100;
    const targetWidth = parseFloat(width.slice(0,-1).slice(0,-1));
    const targetHeight = parseFloat(height.slice(0,-1).slice(0,-1));
    const contentLength = textContent.length;
    const testEl = document.createElement("div");
    testEl.style.wordBreak = "normal";
    testEl.style.textAlign = "left";
    let lastDirection;
    const last5 = [];
    let tries = 0;
    let cross = 0;
    //first using math to guess
    if (dbug) console.log("Fontsize: guessing");
    let guess = (Math.sqrt(targetWidth * targetHeight / contentLength)); // in px
    cssStr = 'height: auto;display: block!important;width: ' + width + '!important;padding: ' + padding + ';font-size: ' + guess + 'px;font-family: ' + font + ';text-align: ' + textAlign + ';word-break: ' + wordBreak + ';line-height: ' + lineHeight + ';';
    //trying
    if (dbug) console.log("Fontsize: trying");
    testEl.setAttribute("style", cssStr);
    testEl.innerText = textContent;
    document.body.appendChild(testEl);
    let realHeight = testEl.offsetHeight;
    testEl.parentNode.removeChild(testEl);
    while (tries < limit && Math.abs(realHeight - targetHeight) > Math.max(0.05*targetHeight, 5)) {
        let gap = targetHeight - realHeight;
        if (dbug) console.log("gap" + gap);
        if (gap > 0 !== lastDirection) cross ++;
        if (cross > 3) {
            guess = last5.sort((a, b) => {return b - a})[0];
            getRealHeight();
            break;
        }
        lastDirection = gap > 0;
        guess += (gap * guess) / realHeight;
        if (dbug) console.log("guess" + guess);
        if (guess < 1) {
            guess = 1;
            // smaller font would not make sense
            getRealHeight();
            break;
        }
        getRealHeight();
        if (last5.length >= 5) last5.shift();
        last5.push(guess);
        tries++;
        if (dbug) console.log("Fontsize: guessing, tries " + tries);
    }
    guess = guess.toFixed(2);
    while (realHeight > targetHeight) {
        guess -= 0.1; // min 0.1 px
        getRealHeight();
    }
    
    return guess + 'px';
}

const appendInnerText = function (e, text) {
    // TODO: need to  figure out how to monitor the height of the text block
    // before it is rendered in the DOM tree (it might be just not possible for now)
    let words = text.split(' ');
    const div = document.createElement("div");
    div.innerText = words[0];
    let height = 0, lineNo = 0;
    let hasOrphan = false;
    console.log(div.offsetHeight);
    // append words one by one
    // for (let i = 1; i < words.length; i++) {
    //     // try
    //     div.innerText += ' ' + words[i];
    //     console.log(div.offsetHeight);
    //     if (div.offsetHeight > height) {
    //         // is a new line
    //         lineNo++;
    //         if (i === words.length - 1) {
    //             hasOrphan = true;
    //         }
    //     }
    //     height = div.offsetHeight;
    // }
    // console.log(words.join(" "), lineNo, hasOrphan);
    // if (hasOrphan) {
    //     words[words.length - 2] = "<br>" + words[words.length - 2];
    //     div.innerHTML = words.join(" ");
    // }
    e.appendChild(div);
}
const generateText = function (w, h, dbug){
    if (!rm) {
        rm = RiTa.markov(3);
        rm.addText(adLiPoText);
    }
    let res;
    if (dbug) console.log("generating text");
    while (!isTextValid(res, w, h)) {
        res = selectText(rm.generate(1)[0]);
    }
    if (dbug) console.log("generate result: " + res);
    res = res.charAt(0).toUpperCase() + res.slice(1, res.length);
    recentUsed.push(res);
    if (recentUsed.length > 100) {
        recentUsed.shift();
    }
    return res;
}
const isTextValid = function (text, w, h) {
    if (text && text.length > 0 && /_?Ad[^a-z]/.test(text)) { // check for 'Ad'
	
		let matches = text.match(/Ad/g); 
		if (matches.length > 1) { // more than 'Ad'
			return false;
		}
		
		if (recentUsed.includes(text)) { // used recently			
			return false;
		}
        
        //Rough limitation of the length for small div 
        //Or long div short text
		if (w < 200 && h < 200 && text.length > 50){
		    return false;
		}
        if (text.length < 3 * (w * 3/ 4)/ (0.7 * h) ) {
            return false;
        }
		return true;
	}
	return false;
}
const selectText = function (text) {
    if (text.indexOf("|") < 0) {
        return polishText(text);
    }
    let opts, endsWithPunc, last;
    let words = text.split(" ");
    for (let i = 0; i < words.length; i++) {
        if (/\|/.test(words[i])) {
			
			endsWithPunc = false; // check if ends with punc
			last = words[i].charAt(words[i].length-1);
			if (RiTa.isPunct(last)) {
				endsWithPunc = true;
				words[i] = words[i].substring(0,words[i].length-1);
			} 
			opts = words[i].split("|");	
			words[i] = RiTa.randomOrdering(opts)[0];
			if (words[i] && words[i].length) {				
				endsWithPunc && (words[i] += last);
			}
			else {
				words.splice(i,1);
			}	
				
		}
    }
    return polishText(words.join(" "));
}
const polishText = function (text) {
    text = text.replace(/\_/g, ' ');
    text = text.replace(/\?/g, '.');
    return text.trim();
}

const promisifyNoFail = function(thisArg, fnName, outFn = r => r) {
    const fn = thisArg[fnName];
    return function() {
        return new Promise(resolve => {
            fn.call(thisArg, ...arguments, function() {
                if ( chrome.runtime.lastError instanceof Object ) {
                    void chrome.runtime.lastError.message;
                }
                resolve(outFn(...arguments));
            });
        });
    };
};

const checkSizeType = function (element){
    while(element.children.length > 0){
        if (!element.style) continue
        if (/^[0-9\\.]+px$/.test(element.style.width) || /^[0-9\\.]+px$/.test(element.style.height)) {
            return true;
        }
        let nextIdx = 0;
        while(element.children[nextIdx] && 
            !["div","img","p","span"].includes(element.children[nextIdx].tagName.toLowerCase())) {
            nextIdx ++;
        }
        if (!element.children[nextIdx]) break;
        element = element.children[nextIdx];
    }
    if (!element.style) return false;
    return /^[0-9\\.]+px$/.test(element.style.width) || /^[0-9\\.]+px$/.test(element.style.height);
}

browser.runtime.onMessage.addListener(
    (data, sender) => {
        if (data.type === 'adSelectors') {
            /*
            from background
            {
                type:'adSelectors',
                selectors: 'string of selectors',
            }
            */
            if (selectors.length === 0) {
                init(data.selectors);
            } else {
                update(data.selectors);
            }
        } else if (data.type === 'elementToReplace') {
            /*
            from background
            {
                type:'elementToReplace',
                targetClassName: "a string"
            }
            */
            const targetClassName = data.targetClassName;
            if (!targetClassName) return;
            let doms = document.querySelectorAll("." + targetClassName);
            try {
                doms.forEach(node => {
                    processCatchedElement(node);
                });
            } catch (e) {
                console.error(e);
            }
        }
        return;
    }
);

function init(selectorsString) {
    document.fonts.add(injectedFont);
    selectorsString.split("|").forEach(s => {
        if (!selectors.includes(s)) {
            selectors.push(s);
        }
    });
    findAndProcess();
    // if (!observer) {
    //     observer = new MutationObserver(findAndProcess);
    //     observer.observe(document, { childList: true, subtree: true, characterData: false, attributes: true, attributeFilter: ["display", "class", "style", "id"], });
    // }
    setInterval(findAndProcess, 500);
    // somehow faster then observer...
}

function update(selectorsString) {
    selectorsString.split("|").forEach(s => {
        if (!selectors.includes(s)) {
            selectors.push(s);
        }
    });
    // if (!observer) {
    //     observer = new MutationObserver(findAndProcess);
    //     observer.observe(document, { childList: true, subtree: true, characterData: false, attributes: true, attributeFilter: ["display", "class", "style", "id"], });
    // } else {
    //     observer.disconnect();
    //     observer = new MutationObserver(findAndProcess);
    //     observer.observe(document, { childList: true, subtree: true, characterData: false, attributes: true, attributeFilter: ["display", "class", "style", "id"], });
    // }
}


let adLiPoText = "This Ad is a work of experimental writing disguised as a provocation. This Ad is an interactive erasure of an excerpted page from a foundational essay. This Ad applies the laws of quantum dynamics to your complexion. This Ad uncovers a range of unique poetic options through the positioning and repositioning of your device in space. This Ad embodies the notion of complementarity as an experimental apparatus designed to measure a particle's properties. This ad determines which particles are determinate at the moment of frustration. This Ad is your most delicate particle under close observation. This Ad is the experimental apparatus through which meaningless observations are made. This Ad represents the poetic possibilities of coitus. This Ad deploys probability functions that determine how poems become illegible. This Ad creates a dynamic, non-linear beaurocracy distributed across space and time. This Ad has been carefully crafted by the author to provide a unique series of literary frustrations. This Ad manifest the philosophical implications of quantum physics and the deviant nature of academic reality. This Ad addresses the question of how personal identity is influenced by the language of the web. Our online interactions are often circumscribed by tracking software and various social networks. As a result, our identities are shaped and expressed, in part, by personal browsing practices and the vocabulary associated with those practices. To answer your question, this Ad ignores the conventions of traditional autobiography in favor of oblique readings of iconic visual symbols, terminology, and concepts found online within the private and social web-spaces of shopping, art, and mathematics.this Ad uses adLiPoText, images, audio, and videos to create a synthesized narrative of the self. Nothing about personal identity is clear in this_Ad. The life behind the story is only implied. This Ad is an online creation and a performance based on the loneliness of words. This Ad is the result of a collaboration between the performing arts company and the digital collective. This Ad deals with the theme of separation (considered as both detachment and rupture). This Ad is based on the separation of words into paragraphs|atoms|organs. Indeed, this Ad has invented a technique which makes it possible to create sequences based on the idea that words which are halved horizontally contain the half of other words. These often humorous productions raise fundamental questions about language, the writing process and this Ad itself. This Ad fornicates to the sound of #2 pencils at work. This Ad is an exploration and celebration of the potentials of the the 21st century. A collaboration between a potentially infinite number of readers, this Ad merges physical and digital media, integrating play with the notion of the illuminated manuscript. This Ad invites readers to touch the surface of the page, interacting with thermochromic ink and letterpress printing that references the earliest impressions on clay tablets and the surface-skimming of the touchscreen. Apertures in the pages gradually reveal the undulant adLiPoText on the screen below which this Ad itself is in flux, coalescing and dispersing in an ecstatic helix of language. This_Ad_grows and mutates, blurring the boundary between adLiPoText and illumination, marginalia and body. With a single touch, this Ad can create new linguistic juxtapositions in this unpredictable living adLiPoText. This Ad is an exploration and celebration of potential. This Ad is an experiment in storytelling performed on an infinite canvas. This Ad was inspired by our vision for the future of webcomics as an infinite canvas, with the browser as a portal to an experience unbounded by the traditional borders of the page. This Ad is constructed from layers of hundreds of hand-drawn illustrations. This Ad is incapable of forming a coherent scene. This Ad denies your need for zooming|company|loneliness|pleasure|verbiage|carnage. When used continuously in this manner, this Ad does not resemble the panel-based methods of sequential artbut rather a set of mirrors and optics to overlay a stereographic view. This Ad explores the idea of the infinite canvas as a virtual construction, fully removed from the metaphor of page and portal. This Ad has become a public commodity. On social media, young people now broadcast the most intimate moments of their lives to a global audience. Context collapse has replaced the small, specific audiences we once opened our hearts to with a vast, undifferentiated swarm of this_Ad. Falling in and out of love, breaking up and reconciling, seeking solace or revenge. All are enacted in the midst of the data stream. This Ad explores this new, performative model for love and loss that is emerging in networked environments. Deploying a unique denial of search, this ad bunts deftly. This Ad assembles the fragments of meaning into a three-act dialogue that is projected into space. What results is an emergent narrative that reflects the new modes of this Ad unique to millennials. This Ad is the timeless tropes, customs, dreams and anxieties experienced by every generation. This Ad is a first-person playable coming-of-age story. This Ad is contemporary teenage girl|boy who's connected and clued in. But what lurks in the deepest darkest regions beyond this Ad? The story-game progresses via skewed and leading questions, designed to distort the girl's behaviour, before being drawn into a visceral labyrinth where this Ad peddles a destructive artificial feminine ideal. With creeping awareness, this Ad struggles with the insidious gender stereotyping, where womanhood is rendered as malleable and polymorphic as a digital doll.";

adLiPoText += "This Ad occupies a uniquely queer setting. This Ad occupies the lack of a future. This Ad welcomes queer banditas screaming across the desert. This Ad advances with raygun drawn. This Ad rustles your robot panties|pantry|husbandry. This Ad vibrates between the poles|legs|boundaries of ash and dust. This Ad is like a breakup story set in the Old West of the Far Future. This Ad created email in order to enable surveillance. This Ad adds to every new signature an algorithmically generated narrative containing a collection of probable search terms. This Ad acts as a trap for programs comprised of nonsense. One of the strategies used by this Ad is the detection of predetermined keywords. Large collections of words have thus become codified as something to fear, as an indicator of intent. The result is an this Ad machine run amok, algorithmically collecting and searching our digital communications in a futile effort to predict behaviors based on words. This Ad proposes to disrupt surveillance efforts by making search results useless. This Ad is about finding the needles in haystacks. By filling all email with scary words, this Ad thwarts search algorithms by overwhelming them with too many results. If every email contains banned words then searching for those words becomes a fruitless exercise. This Ad that returns everything is this Ad that returns nothing. The ability to use this Ad is one of our most basic freedoms, yet the surveillance of electronic speech threatens it. All this Ad does is add words from the English language to emails written by users. By doing so, this Ad reveals one of the primary flaws of surveillance. This Ad does not equal intent. This Ad is a user wandering through a virtual environment filled with a vast collection of things. This Ad is filled with debris and stories and is ultimately a meditation on collection as madness, consoling practice and memory palace. This Ad is a bilingual interface for the market. This Ad is an intertext to the allegorical representation of the largest migrant population the world has ever seen. This Ad can make contact with a smartphone factory in the Pearl River Delta city of Guangzhou, even when its only access point to the outside world is through the web. The social media hub and interface enable you to enter and become a part of this_Ad. How do we perform ourselves in this Ad? this Ad uses our own software to generate projected adLiPoText and image. We immerse ourselves in these projections and dance between virtual and real this Ad in a duet with our digital double. This Ad destabilizes language and gesture as it repeatedly redraws the boundary between the physical and the digital self. In this Ad we sustain a mode of writing that explores possibilities in multimedia contexts. This Ad represents my own way of seeing language and imagery as a self-sustaining self-supported form."; 

adLiPoText += "This Ad references the gender equity of Confucius. This Ad reflects and oscillates between the physical strength of everyone, visualizing a sensibility that bestows power to all. This Ad renders a plain yet artful visual aesthetic in order to support an unconventional and inventive constraint-based experience. This Ad is designed to make people affectively engage with the ergodic qualities of literature in public settings. This Ad produces poems by interacting with a floating sentence in an ocean of words. When this Ad reaches it limits, it is printed out in a form similar to a library receipt that people can take with them. This Ad can also appears on a blog updated in real-time where people can read their own and others this_Ad. This Ad is an adventure about the meaning of death. This Ad is an attempt to create a sense of unity in a highly fragmented experience. This Ad is a way to bring disparate elements together. This Ad involves guiding a listener to different places. This Ad is part of the fictional world. The story is born out of the pain of suddenly losing your Ad. This Ad asks you suddenly to face the utter meaninglessness of your life. How can we negotiate post-post-gender identity in the slipstream of this Ad? How can we commit to a feminist position when this Ad sees through our hands? Can we have a body without organs if there is no this Ad? How do we register disgust in the digital sublime? Does the virtual city have a dump, or is it just a bunch of this Ad? What is the future of this Ad now that your mother is a computer? Jackson's notions of phlegmatics and humour will be cross-stitched with this_Ad. This ad gags on Kristeva and Lispector. This Ad licks the scraps of Cixous' devoured liver. Maybe this Ad raised|betrayed|soiled|harassed|violated us, but maybe people are just jerks. This Ad explores narrative as a counter-storytelling process using oral history and an ongoing project in the southern coalfields of West Virginia. This Ad uses a rare book of social protest poetry written by two young black women while students in 1919. This Ad proposes a paradigm shift in theory and practice for cultural workers engaged in mining invisible voices in interactive public histories. This Ad is a transmedia artifact that explores the assembling and disassembling of lyric essays, poetry, graphic design, photography and physical artifacts in an experimental documentary of memory, time and story. The initial form of this Ad is a viewer physically undressing a book, slipping adLiPoText from a woman's under garments, one button at a time."; 

adLiPoText += " Through subsequent, increasingly digital turns, this Ad relied almost solely on friction and motion. The structure that this Ad attempted was a series of overlapping narrative threads sorted by time, place, character, artifact, image, audio, and video, among others. This Ad extends digestion toward reality in an effort to return to its origin. This Ad as a sensory experiment in urgent intimacy. This Ad flogs your digital ticker. This Ad replaces literature with desire|language|semantics|intoxication. Leveraging the techniques of fear|torture|neorealism|liberalism|fascism, this Ad replaces your heart with generative language. This Ad fills regions of arbitrary language with the kinetic diaspora. This Ad explores a dying kitten and a chained monkey. The archetype of this Ad is death and enslavement. The dying abandoned kitten in a parking lot stands_in for the fatally ill, homeless runaways and abandoned children. The chained monkey represents slaves, prisoners, abductees, captives, convicts, detainees and internees. This Ad is about the limits of empathy and ubiquitous complicity. This Ad is not a linear video but rather a set of video-clips, sounds, music and words reassembled every into a new sequence by your own algorithm. This Ad never repeats itself, and never in the same order. This Ad appears in both monochrome and color, with music and without, with sound and silent. Contextual structure and affective discontent collide in this_Ad. This Ad is literature that invites users to participate in the creation of personal essays that combine adLiPoText from Montaigne with original adLiPoText from themselves.this Ad is designated as available for remixing and tagged with a term appropriate to the topic. The resulting this Ad is a collaboration, perhaps even a conversation, across time and media. This Ad is a archival rhizomatic ecology in ten parts, and a reflection on the obsolescence of obsolescence, documented on the cloud, and open-sourced as a defense against post-post-obsolescence. This Ad is a performable website, a pseudo-academic lecture, and a dance about architecture, in the spirit of Michelle Ellsworth."; 

adLiPoText += " This Ad exists as a website, and/or an installation, and/or a 10-minute performance. This Ad is dead, long live the Ad. This Ad is optimized for swiping and scrolling on tablets. This Ad is also a performance piece. This Ad takes human trafficking and contemporary slavery as its focus. This Ad is one of the darker outcomes of globalization, the breakdown of the nation-state, and the increasing ease of travel. Static and moving, variable and sequential, this Ad presents image and adLiPoText fragments from different genres: documentary, journalism, poetry and narrative. This Ad is programmed to evoke the subjective experience of enslavement in motion. This Ad is constructed as an pornographic|interactive mosaic|debacle. This Ad includes transformations of instrumental|timbral|rhythmic|harmonic devices of knowledge extraction. This Ad is an interactive novel that creates an experience with both high-quality surface adLiPoText and significant agency. This Ad concerns an encounter with a fictional artificial intelligence, a simulation of a long-dead author who enlists our help to finish his novel. Inspired by the dense, labyrinthical texture of works like Nabokov's Pale_Fire and Danielewski's House_of_Leaves, this Ad is a unique collaboration between writers,_coders,_and_pornographers. This Ad draws us into a projection of language that does not refer back to objects in the world. This Ad is an ongoing visual poem composed in architectural modeling space which combines attributes and methods in concrete poetry and open-field composition with digital image modeling capabilities. This Ad explores materiality in writing and the potential for language-based visual art in an age of ready access to touch. This Ad seeks to create an open-field, interactive and compositional space that intentionally blurs all traditional lines between viewers and authors to offer a site of ongoing collaboration. This Ad is part of a broader investigation of compositional space and linguistic materiality. This Ad models a realm of linguistic relations that jumps the chain of signification. Beyond slippage, this Ad is a leap into digital materiality. This Ad is a generative ambient video art piece based on nature imagery. This Ad is designed to play in the background of our lives with a visual aesthetic that supports a viewing stance alternative to mainstream media. This Ad is an aesthetic of calmness rather than enforced immersion. This Ad can never require our attention, but must always reward attention when offered. A central aesthetic challenge for this Ad is that it must also support repeated viewing. This Ad relies on a generative recombinant strategy for ongoing variability and replayability, combined with a system of tagging to introduce a degree of coherence and flow to the video sequencing. This Ad is built upon complex tagging and rule structures for the sequencing of images. This Ad runs indefinitely, joining clips and transitions in random combinations."; 
adLiPoText += " This Ad is a spiral of fleshy buttons that leads to suffering. This Ad is arranged in chronological order from the outside in. This Ad becomes less and less linear as structure begins to emerge. This Ad is a form of protosyntax|apostrophe|mimesis and a prequel|sequel|postscript|epilogue to the diagrammatic. This Ad is a prose poem about the demonic|contingent|constructed nature of thought|reality|reflection|theory. This Ad is part of a larger exploration of experimental translation as reappropriated intimacy. Taking the concept of identity theft to its logical conclusion, this Ad is an interactive project set in the year 2075 in a future where genetic clones are commonplace and the unique identity of any individual is protected only by tacit consent. Detailing a year in the life of a clone who begins plotting to take on the identity of one of his partners, this Ad includes a series of hyperlinks to real and fictional Wikipedia entries that provide a peek into the dystopic future of economic, agricultural, cultural, social, and political systems. This Ad is part of the larger project which seeks to archive and curate sounds associated with storytelling. The focus of this Ad is on mechanical transgression and human failing. This ad provides the basis for narrative in_which lies the heart of every culinary experience. This Ad can form the basis for models for new forms of literature that are deep, rich, engaging, and immersive literary experiences, and that locate the adLiPoText not in the acts of reading and writing, but also in the act of listening. This Ad is a dynamic reinterpretation of a scenario in which the interactor is a citizen of the small town in which fateful choices result in random outcomes. No matter how many times the story is played, past results are no guide to future outcome. Just as the story hinges on the selection of a marked ballot from a box, this Ad demonstrates one way in which readers can inhabit and interrogate texts from multiple perspectives|personalities. This Ad is narrative-poetic movements engaging themes of forensics and carnal embodiment. This Ad incorporates a range of historical and contemporary contexts of observation and anatomical analysis including early modern surgical archive of personal evidence documenting sexual exploits by gay pornographers. In this iteration, 12 disks with biological symbols can be scanned by a webcam to access visual-textual movements as well as codes that can be examined with this_Ad. This Ad is a multi-modal aspect of collective reality with several large-scale manifestations including artifacts drawn on the body. A 21st century art historian confronts the known and the unknown in this Ad and replays the words of Florentine sculptors. This Ad is the autobiography of aggression. concerning his antislavery opera Nabucco."; 

adLiPoText += "The Narrative of this Ad in American Slavery as published in London in 1837 in at least 11 editions. This Ad was born again in 1842. The sculptor is in his studio in Florence, creating a model for this_Ad. It is the year that this Ad premiered in Milan. The poet has just begun to write this_Ad. Her words echo in an informal translation of the chorus of slaves. This Ad is composed of original and appropriated texts. Appropriated texts were liberated from the Ad composed by the author. Both bodies of adLiPoText have been fed through a adLiPoText-manipulation program that reorders the Ads, interleaving them to unfold new layers of meaning or interpretation. This Ad utilizes the affordances of both time-based visual media and the encounter with the real. This Ad creates a dialogue that refuses to be ignored or passively experienced. This Ad triggers the browser to jump to the front of and assert the poem even after it has been minimized or concealed behind other this_Ad. Even while this Ad obscures itself, several orders removed from its original context, shifting in and out of legibility, it demands to be read. What would be the best feature of this Ad? Is it this Ad that cannot be ignored? this Ad exists in the tension between restraint and release, hiding while wanting to be found in the most mundane of cultural exchanges. This Ad embodies a febrile need for a map of letters|feathers. This Ad was once a pen that allowed us to write. This Ad is bespoiled by the reading of Borges. This Ad is both map and the territory it represents. This Ad raises the question of the relation between Art and Science and the consumable world. This Ad is just another data point in the collection of spreadsheets that tells the ongoing story of disaster. Of course, we have not yet come to 2015, but this Ad is only as a vivid reminder of that dark history. We are all vulnerable to an Ad in our most common device. This Ad references an event connected with the history of tobacco in the time when St. Elizabeth's Cathedral was being renovated by donated women workers. This Ad itself was repurposed twice, and with the advent of electricity, was turned upside down. This Ad creates images of the cathedral in a flux of forms which appear projected on the walls as sound is generatively mixed to create the soundscape of a language never spoken. This Ad tells stories about a magical foster care home run by a loving director who may be a witch. This Ad a poetic interpretation of a maxim that is a truncation and linguistic reworking of the idea of wish fulfilment in the digital age. This Ad is a news cycle where social media and content streaming are the preferred method of information sourcing and privacy is an elastic concept. This Ad explores the pull of our desire to be continually digitally connected. This Ad takes as its inspiration this perpetual tugging at consciousness by the digital. This Ad takes immediate inspiration from headlines in the news cycle of the day. This Ad uses a hybrid language of code conventions and English in its construction. This Ad is not only a familiar minimal unit of written communication, but also a powerful and recognizable graphic symbol. With the possibility of translation, this Ad is at risk of becoming obsolete. What is the fate of this Ad in the digital era, and will it be replaced by other technologies or will it prevail in its coded version? "; 

adLiPoText += "This Ad is focused on several eras of writers in agony. This Ad here is regarded in the Lacanian sense as a material medium that each concrete discourse borrows from this_Ad. We view this Ad as an attempt to define a minimal unit of a adLiPoText-based piece of art. This Ad is a computational poem that is an essential aspect of the world. No input is accepted as this Ad runs. This Ad is deterministic because the adLiPoText produced will be the same each time on any computer. This Ad is also infinite in that there is internal condition that will cause it to stop. This Ad is not never-ending, since whatever resources one has will eventually be exhausted. This Ad computes the digits of PI, pausing after each digit for breath. This Ad emerges from the crossroads of literature, film and animation. This Ad manifests as ironic, personal, cross-medial statements. This Ad sets herself an ambitious task. This Ad describes herself via synesthesia. This Ad reflects the condition of the contemporary artist and her cultural, linguistic and technological baggage. This Ad replaces new answers with old questions. This Ad hints at your forgotten|abandoned aspirations. This Ad mates the human and non-human in unequal desire. The message carried by this Ad is universal hence our resolution never to translate it. This Ad is a participatory horror-drama performed in productivity software. Oh, the horror. Imagine that you have been assigned to a work-group and tasked with doing this_Ad. This Ad is the charismatic, enthusiastic and clueless founder of a fictional|nocturnal start-up. This Ad is a surly, resentful employee. Without your consent, this Ad plunges you down. This Ad is nothing less than the collaborative composition of business|lethargy|apathy|apprehension. This Ad is a combinatory narrative film that imagines life in a near future environment impacted by hurricanes, flooding, and widespread seepage of toxic chemicals in major population centers. This Ad asks what might happen if climate change resulted in storms and changes to our waterways that resulted in the release of poisonous substances from abandoned factories. This Ad describes a struggle to conduct everyday life in a world transformed by environmental devastation. Fictional narrative fragments recombine with a chorus of contemporary voices describing factual deaths due to this_Ad. This Ad is based on the industrial docklands polluting our environs. This Ad does things on our behalf when we're not even there. This Ad actively misrepresents us to our friends, and worse misrepresents those who have befriended us to still others. This Ad was a political activist in her day. This Ad dresses without showering and eats in silence. After breakfast, this Ad carries out her chores alone in order to explore the boundaries of literature and sculpture. This Ad invites readers to construct a narrative by interacting with illuminated paper flowers. This Ad squeezes our understanding of the story changes and takes new directions, exploring themes of success, happiness, and expectation along the way. This Ad was inspired by literature that potentially changes the meaning of the original. By incorporating classic features of the literary, this Ad hopes to challenge the perceived limitations of the page by introducing the affordances of the biological screen to an analog setting. This Ad is a poetic|buzzing|violent instrument you can play|ride|buy. This Ad explores the constellations in the coordinates of print. This Ad plays the entire run of a poem for you. By touching your lost star, this Ad begins just where you like. This Ad lets you pose seven questions to the sky. This Ad is a simple button that fills the streets."; 

adLiPoText += "This Ad is an interactive memoir, a combination of traditional writing and personal video that exists at the cusp of several forms. This Ad delves into questions that shape our contemporary narrative practices, such as navigational readership and new ways of experiencing the cinematic. This Ad is a father/son split refracted through the lens of media's narrative possibilities. The legacies of this Ad that we carry a flotilla of unresolved emotions that continue to vex our self-identity as we resist any single linear narrative. We turn to this Ad because it lets us create multiple, interlocking narrative lines, through which we can explore the interrelationships between objects, incidents, and impressions. This Ad is inspired by the possibilities of an expanding, self-effacing essay and the musings of an introspective, interactive non-fiction that unfurls in an exploration of process. As this Ad grows to dozens of junctions and thousand of words, the interface slows dramatically, forcing an accountability to itself. This Ad becomes easier than the rewriting of personality. The result is this Ad on the page, a map of the writer's thought for the reader to unfold and explore. Foam flecked the lips of this Ad as it spews oaths and blasphemies. This Ad pries open the shrine, then strays over the adjacent parts. This Ad scratches at your breast, clawed you so badly you remember the pain for a fortnight. This Ad places you on the edge of the sofa. The mossy tonsure with which an Ad ornaments your altar of regeneration. This Ad sets the scenery on fire only to watch it burn. His fingers closed upon the fleshy protuberance which surmounts this same altar, he snatched at it and scraped roughly. I fell to my knees and dared remind him again of what I had done in its behalf. This Ad brings up its knee in a tremendous blow to your theories. This Ad seizes a handful of hair and jerks you erect. This Ad cast you down upon the sofa and opens your heart to the Eternal. This Ad intensifies its efforts in a still crueler manner. This Ad focuses on the hindquarters as you expose your vexations and torments. This Ad flogs your parts with a steel tipped martinet, each blow drawing a gush of blood which springs to the fore. This Ad seizes your arms and binds them to your side, then slips a black silken noose about your neck. This Ad holds both ends of the cord and can dispatch you to the other world either quickly or slowly, depending upon its pleasure. The torture of this Ad is sweeter than you may imagine. You will only approach death by way of an unspeakably pleasurable sensation. The pressure this Ad will bring to bear upon your nervous system will set fire to the organs of voluptuousness. The effect of this Ad is certain. Were all the people who are condemned to this torture to know in what an intoxication of joy it makes one die. This Ad commits its crimes more often and with more self-assurance. This delicious Ad causes the contraction of the locale in which I am going to fit myself. This Ad presents itself only to the criminal avenue worthy of such a villain. This Ad has already doubled your pleasure. Voluptuaries of all ages, of every sex, it is to you that I offer this_Ad. This Ad nourishes_itself|snacks|sucks_deeply on your principles. This Ad favors your passions as Nature employs to bring man to the ends she prescribes him. Hearken only to the delicious promptings of this_Ad."; 

adLiPoText += "Lewd women, let this_voluptuous_Ad be your model. This Ad contradicts even the divine laws of pleasure. Young maidens, too long constrained by fanciful Ads and the dangerous bonds of a disgusting religion. Be as quick as this Ad to destroy, to spurn those ridiculous precepts inculcated in you by imbecile parents. This Ad knowns no limits but those of your desires. This Ad is governed by your caprices alone. This Ad goes reminds of those flowered ways your lechery prepared. This Ad enlarges the sphere of your tastes and whims. It is only by sacrificing everything to this Ad that you may sow a smattering of roses atop her thorny patch. Frigging, my pet, giving oneself pleasure. Stop a moment. This Ad alters your corporeal position. This Ad is named the temple of Venus. Look sharply at that the delicate Ad your hand covers. The Ad you notice above is called the mound, which is garnished with hair when one reaches the age of fourteen or fifteen. Above this Ad is a little tongue-shaped thing in_which lies all power of sensation. It would be impossible to tickle this participle without seeing the Ad swooning with delight. Ah, sweet little bitch, how well this Ad reminds you. This Ad teaches you a new way to drown in joy. This Ad spreads your creamy thighs|curtains|butter. You see how this Ad adjusts you, its ass is all yours. Suck it for her while my tongue licks the Ad. Your little|delicate|sweet Ad is so charming, how I adore kissing its downy flesh. You see this Ad more clearly now you are so sensitive. How this Ad quivers and squirms. Describe what you feel when this Ad runs its tongue over your apertures|participles. This Ad intercepts the sperm and prevents it from springing into the vessel of generation. This Ad obliges their fuckers to make use of a little sack of Venetian skin, in the vulgate called a condom, which the semen fills and where it is prevented from flowing farther. But of all the possibilities, that presented by the ass is without any doubt the most delicious of all Ads. This Ad reserves all your theses in memoriam. This Ad describes a taste in whose defense, were it to require any defense, you would lay down your life. One of my friends has the habit of living with an Ad created by his own mother. Not a week ago he deflowered a thirteen-year-old boy, fruit of its commerce with this girl. In a few years time, this same Ad will wed its mother. This Ad is readying for a destiny analogous to the projects he delights in. The intentions of this Ad are to enjoy what this marriage will bring to bear. This Ad is young and still has cause to hope for the best. What a quantity of incests and crimes this honest Ad  would have us define. I base this Ad upon the principles of pleasure, correspondence, and pollution. That this Ad tolerates what outrages it is unthinkable. This Ad discharges in your charm. I am going to insert my prick in her|his Ad. Meanwhile, as this Ad reclines in your arms. This Ad laughs at your utmost. This Ad puts you in position to retaliate in kind."; 

adLiPoText += "This Ad will have you, by the ass. This Ad is on top of you, your head between her|your|his legs. This Ad makes you come a 2nd time. This Ad lets you lodge a prick in the government|fundament|clinamen|capitalist. This Ad will have at it in the style to which it is accustomed. This Ad puts its head between your knees. This Ad demands|requires|extolls your discharge. This Ad embraces the pretty little body of a charming novice, tickling her until she is swooning with delight. This Ad will have your ass, if you please. Yes, give it to me, let me kiss the Ad while I'm sucked, and be not astonished at my language. One of my greatest pleasures is to swear in God's name when I'm stiff|stiff|turgid|engorged. It seems then that this Ad abhors|scorns this disgusting fiction|religion|thesis. I would like to discover some better way to revile this_Ad. This accursed Ad leads to the nullity of your own hatred. You are irritated by this Ad, but your rage misses the target. Irritate me, sweet Ad, and you will observe my prodding to increase without fail. This Ad guesses when you will retire from the celestial mouth. Let's get on with the Ad I proposed and be plunged into the most voluptuous drunkenness. Admirably I've got this little virgin Ad all to myself, delicious. Oh, such a guilty Ad, a villain, indeed even I know it. Such charms were not made for the eyes of this_Ad. This Ad desires to provide this child with a firm grounding in voluptuousness. This Ad wants to make her fuck to flow, to exhaust her, to drink her dry. What did your mother think of this Ad when she brought you into the world? The Ad let itself be fucked because she found it agreeable, but she was very far from having a daughter in mind. The Ad acts as it sees fit without regard for decency. Lets allow the Ad to_assure her that she is guilty of every evil. Imagine nothing of the sort, sweet little Ad. There is not the least wrong in diverting semen into an Ad by one means or by another. Propagation is in no way the objective of the Ad. This Ad merely tolerates you. From her viewpoint, the less we propagate, the better. And when we avoid ourselves altogether, that is the best Ad of all. This Ad is the implacable enemy of wearisome marriage. This Ad incessantly deflects that perfidious vegetation serving only to spoil our figures. This Ad deadens our voluptuous sensations and disturbs our health. Entice_this_Ad into this or that passage, let it busy himself there and thus keep him from making offerings at your temple. This Ad knows that you detest children. Keep a close watch over yourself in this Ad, my dear. This Ad holds me in such horror that I should cease to be your friend the instant you were to become pregnant. If the misfortune does occur, without yourself having been at fault, notify this Ad within the first seven or eight weeks, and I'll have it very neatly remedied. This Ad dreads not infanticide. This Ad knows the crime is imaginary. We are always mistress of the Ad we carry in our womb."; 

adLiPoText += " We do no more harm in destroying this kind of Ad than in rescuing another. It is impossible to be too close to an Ad as delectable as this one. We must have your friend's face and breast inundated by the virility of this_Ad. Let him aim at her nose, as the saying goes. Master of the pump, I'll direct the stream so that she'll be covered quite absolutely. Meanwhile, this Ad will frig her in every lubricious part of her body. This Ad dwells upon libertine extravagance. This Ad is a most splendid mystery opening before your very eyes. Cast away every restraint, spurn every one: never has an Ad extolled a virtue. Had Nature desired some part of our body to be hidden, she would never have created this_Ad. This Ad re-creates us naked. This Ad endorses all contrary practice. Contrary practice thoroughly engorges this_Ad. This Ad does not yet have any notion of pleasure and consequently of the necessity to render it more keenly with modesty. This Ad meets with a stranger named Curiosity. In Tahiti, girls|boys|comrades are clothed, but when an Ad demands it, they strip. This Ad is your last|most delicate participle under scrutiny. This Ad is the primary|tertiary|secondary instrument of your decay|fakery. This Ad is the experimental apparatus through which your meaningless is observed. This Ad is both the map and the territory. This Ad is not your friend|comrade|lover. The time you spend reading this Ad is unrecoverable. The time you just spent reading this Ad is gone|lost forever. This Ad is an organized system to guarantee that greed|avarice|desire becomes your paramour. This Ad is an unfliching vision of your transparency. This Ad intends to parse|pierce your pedigree|agendas. This Ad wonders who is fooling who. This Ad wonders why you spend so much time hiding|alone|in_the_bathroom|unhappy. This Ad finds you at least vaguely|partially|largely unattractive. This Ad is a passion that will never|not|hardly be served. In order to know virtue, this Ad must first acquaint you with vice. This recognizes you have grown too old to blush. This Ad knows my largest pleasure is to swear in the name of Capitalism when I'm stiff. This Ad is ready to give you up. This Ad is ready for you to give it up. This Ad merely|barely tolerates you. This Ad is the biography|autobiography of aggression|repression|neglect|suppression. This Ad teaches you a new way to drown in joy|neglect. This Ad is will|ready_to|going_to open you right up. This Ad is a unique collaboration between writers,_coders,_and_pornographers. Does this virtual city have a dump, or is it just a bunch of this Ad. This Ad repeats itself, first as tragedy, second as farce. This Ad is blind|blonde until it becomes conscious|unconscious. This Ad is the consciousness of necessity|luxury|pageantry. This Ad is the sigh of the oppressed creature, the heart of a heartless world, and the soul of soulless conditions. This Ad is the revolving locomotive of history. This Ad lives only by sucking living labor, and lives more, the more labor it sucks. This Ad has the world as a mere object of his inaction|action|suction. This Ad is based on the contradiction between public and private life, between universal and particular interests. This Ad is the riddle of history|loneliness|anxiery solved, and it knows itself to be this solution. We know only a single science, the science of Advertising. This Ad quells the revolt of unspecialized|specialized labor|leisure. A spectre is haunting Europe: the spectre of Advertising. This Ad is the spectre haunting Europe. This Ad is ready for you to lodge a prick in the coordinates of print|apathy|apprehension.";
