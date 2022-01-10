/////////////////////////////////////////////////////////// 
// below is the fix for wash post 
/*
washpost put their ad at fix location and the have a script that overwrite the final child of the element at that position
i.e. our generated text.
below is a kind of tricky solution to revert the changes after they are detected, if this affect the performance, maybe 
move it to a content script that only apply for a list (the first one in the list will be washpost)
*/
let dbug;
let mobserver;

const initObserver = function () {
    dbug = false;
    if (dbug) console.log("preventOverwrite init...");
    if (mobserver === undefined) {
        mobserver = new MutationObserver((theMutationsList, observer) => {
            for (let theMutation of theMutationsList) {
                let targetNode = theMutation.target;
                if (!targetNode) {
                    continue;
                }
                for (let addedNode of theMutation.addedNodes) {
                    if (addedNode.nodeType === 1) targetNode.removeChild(addedNode);
                }
                for (let removedNode of theMutation.removedNodes) {
                    if (removedNode.nodeType === 3) targetNode.appendChild(removedNode)
                }
            }
        });
    }
}

const addObserver = function (idOfelementToObs) {
    let elementToObs = document.getElementById(idOfelementToObs);
    if (!elementToObs) return;
    try {
        mobserver.observe(elementToObs, { characterData: false, childList: true, attributes: false });
    } catch (e) {
        console.error(e);
    }
}

initObserver();

browser.runtime.onMessage.addListener(
    (data, sender) => {
        if (data.type === "elementContainingGeneratedText") {
            try {
                addObserver(data.elem);
            } catch (e) {
                console.error(e);
            }
        }
    }
);
///////////////////////////////////////////////////////////