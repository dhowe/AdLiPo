const selectors = [];
let observer = undefined;
const onloadList = ["body", "frame", "frameset", "iframe", "img", "link", "script"];
const injectedFont = new FontFace("bench9", "url('https://fonts.gstatic.com/s/benchnine/v9/ahcbv8612zF4jxrwMosbUMl0.woff2') format('woff2')");
const isSelectorValid = ((temElement) =>
    (selector) => {
        try { temElement.querySelector(selector) } catch { return false }
        return true
    })(document.createDocumentFragment())
const findAndProcess = function () {
    selectors.forEach(s => {
        s = s.trim();
        if (s.length > 0 && isSelectorValid(s)) {
            let doms = document.querySelectorAll(s);
            doms.forEach(d => {
                console.log(d);
                processCatchedElement(d);
            });
        }
    });
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
    //check the node
    if (node.offsetWidth < 2 || node.offsetHeight < 2) {
        if (dbug) console.log(node, "too small");
        return;
    }

    if (node.classList.contains("AdLiPoReplacedAd")) return; //already changed
    //
    let type = (node.tagName.toLowerCase() === "img" || node.tagName.toLowerCase() === "iframe")
    let oriW = node.offsetWidth;
    let oriH = node.offsetHeight;

    let injectedBG = document.createElement("div");
    injectedBG.setAttribute("class", "AdLiPoReplacedAd");
    injectedBG.setAttribute("style", "background: " + getColor() + "!important;width:" + oriW + "px!important;height: " + oriH + "px!important");

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
        if (!skipText) appendText("This is a test centence. This is another one.", injectedBG);
    } else {
        // div, li, etc
        injectedBG.style.position = "relative";
        injectedBG.style.top = "0px";
        injectedBG.style.left = "opx";
        if (dbug) console.log("replacing ", node, "with", injectedBG);
        node.parentNode.replaceChild(injectedBG, node);
        //append text
        if (!skipText) appendText("This is a test centence. This is another one.", injectedBG);
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
const appendText = function(textContent, element) {
    // textContent should be a string 
    // element should be a DOM element
    if (!textContent || !element) {
        console.error("doLayout requires string and DOM element");
        return;
    }
    if (typeof textContent !== "string") textContent = textContent.toString();
    if (!(typeof HTMLElement === "object" ? element instanceof HTMLElement : typeof element === "object" && element !== null && element.nodeType === 1 && typeof element.nodeName==="string")) {
        console.error("doLayout expects a DOM element, get ", element, "instead");
        return;
    }
    const width = element.style.width;
    const height = element.style.height;
    if (!width || !height || !/^[0-9\\.]+px$/.test(width) || !/^[0-9\\.]+px$/.test(height) ) {
        console.error("doLayout expects a DOM with fixed width and height");
        return;
    }
    //clear target
    while(element.firstChild){
        element.removeChild(element.lastChild);
    }
    const font = element.style.fontFamily || 'Bench9'; // a string representing the font name
    const textAlign = element.style.textAlign || 'left'; // a string representing alignment
    const wordBreak = element.style.wordBreak || 'break-word'; 
    const lineHeight = element.style.lineHeight || 'normal';
    const padding = element.style.padding || "0";
    //deal with possible orphan
    //textContent = textContent.replace(/ +/g, "\\u00a0");// works but not good: 1.jam all letter into one "word"; 2.space might occur at the start of the line
    // const textGroup = textContent.split("\\n");
    // const newtextGroup = []
    // textGroup.forEach(txt => {
    //     const textArr = txt.trim().split(" ");
    //     const final2 = textArr.splice(textArr.length - 2, 2);
    //     textArr.push(final2.join("\\u00a0"));
    //     newtextGroup.push(textArr.join(" "));
    // });
    // textContent = newtextGroup.length === 1 ? newtextGroup[0] : newtextGroup.join("\\n"); // in extremely rare case create word break ...
    
    //compute fontSize
    const fontSize = computeFontSize(textContent, width, height, font, textAlign, wordBreak, lineHeight, padding);
    //set to the div
    element.style.color = "#fff";
    element.style.fontFamily = font;
    element.style.textAlign = textAlign;
    element.style.fontSize = fontSize;
    element.style.wordBreak = wordBreak;
    element.style.padding = padding;
    element.style.lineHeight = lineHeight;
    //use a inline element to wrap it, so it can be in the middle
    element.style.display = "table";
    const spanElement = document.createElement("span");
    spanElement.style.display = "table-cell";
    spanElement.style.verticalAlign = "middle";
    spanElement.innerText = textContent;
    dealWithOrphan(spanElement);
    element.appendChild(spanElement);
}

const computeFontSize = function(textContent, width, height, font, textAlign, wordBreak, lineHeight, padding, tryLimit) {
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
    let lastDirection;
    const last5 = [];
    let tries = 0;
    let cross = 0;
    //first using math to guess
    let guess = (Math.sqrt(targetWidth * targetHeight / contentLength)); // in px
    cssStr = 'height: auto;display: block!important;width: ' + width + '!important;padding: ' + padding + ';font-size: ' + guess + 'px;font-family: ' + font + ';text-align: ' + textAlign + ';word-break: ' + wordBreak + ';line-height: ' + lineHeight + ';';
    //trying
    testEl.setAttribute("style", cssStr);
    testEl.innerText = textContent;
    document.body.appendChild(testEl);
    let realHeight = testEl.offsetHeight;
    testEl.parentNode.removeChild(testEl);
    while (tries < limit && Math.abs(realHeight - targetHeight) > Math.max(0.05*targetHeight, 5)) {
        let gap = targetHeight - realHeight;
        if (gap > 0 !== lastDirection) cross ++;
        if (cross > 3) {
            guess = last5.sort((a, b) => {return b - a})[0];
            getRealHeight();
            break;
        }
        lastDirection = gap > 0;
        guess += (gap * guess) / realHeight;
        getRealHeight();
        if (last5.length >= 5) last5.shift();
        last5.push(guess);
        tries++;
    }
    guess = guess.toFixed(2);
    while (realHeight > targetHeight) {
        guess -= 0.1; // min 0.1 px
        getRealHeight();
    }
    
    return guess + 'px';
}

const dealWithOrphan = function (e) {
    const content = e.innerText;
    e.innerText = "";
    let words = content.split(' ');

    e.innerText = words[0];
    let height = e.offsetHeight;
    let hasOrphan = undefined;

    // append words one by one
    for (var i = 1; i < words.length; i++) {
        e.innerText += ' ' + words[i];
        if (e.offsetHeight > height) {
            // is a new line
            height = e.offsetHeight;
            if (i === words.length - 1) {
                hasOrphan = true;
            }
        }
    }
    hasOrphan = false;

    if (hasOrphan) {
        words[words.length - 2] = "\n" + words[words.length - 2];
    }

    e.innerText = words.join(" ");
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
