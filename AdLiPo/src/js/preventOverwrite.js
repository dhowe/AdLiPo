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

const init = function() {
    dbug = true;
    if (dbug) console.log("preventOverwrite init...");
    mobserver = new MutationObserver((theMutationsList, observer) => {
        //if (dbug) console.log(theMutationsList);
        theMutationsList.forEach((theMutation, i) => {
        //if (dbug) console.log(theMutation);
            let targetNode = theMutation.target;
            //if (dbug) console.log(targetNode);
            if (!targetNode){
                // skip this
            } else {
                let addedNodes = theMutation.addedNodes;
                if (addedNodes && addedNodes.length > 0){
                    addedNodes.forEach(addedNode => {
                        targetNode.removeChild(addedNode);
                    });
                }
                let removedNodes = theMutation.removedNodes;
                if (removedNodes && removedNodes.length > 0) {
                    removedNodes.forEach(removedNode => {
                        targetNode.appendChild(removedNode);
                    });
                }
            }
        });
    });
}

//slow....
const addObserver = function(idOfelementToObs){
    //if (dbug) console.log(idOfelementToObs);
    let elementToObs = document.getElementById(idOfelementToObs);
    if (!elementToObs) return;
    try {
        mobserver.observe(elementToObs, {characterData: false, childList: true, attributes: false});
    } catch (e) {
        console.error(e);
    }
}

init();

browser.runtime.onMessage.addListener(
    (data, sender) => {
        if (data.type === "elementContainingGeneratedText") {
            try{
                addObserver(data.elem);
            } catch(e){
                console.error(e);
            }
        }
    }
);
///////////////////////////////////////////////////////////