browser.runtime.onMessage.addListener(
    (data, sender) => {
        const tabId = sender.tab.id;
        switch (data.type) {
            case "elementToReplace":
                if (tabId === undefined) return;
                try {
                    let sending = webext.tabs.sendMessage(tabId, data);
                    sending.then(() => { }, (e) => { console.error((e)) });
                } catch (e) {
                    console.error(e)
                }
                break;
    
            case "userStylesheetCSS":
                const selectors = data.cssText;
                if (tabId === undefined || selectors === undefined) return;
                try {
                    let sending = webext.tabs.sendMessage(tabId, {
                        type: "adSelectors",
                        selectors: selectors,
                    });
                    sending.then(() => { }, (e) => { console.error((e)) });
                } catch (e) {
                    console.error(e)
                }
                break;
            case "elementContainingGeneratedText":
                if (tabId === undefined) return;
                try {
                    let sending = webext.tabs.sendMessage(tabId, data);
                    sending.then(() => { }, (e) => { console.error((e)) });
                } catch (e) {
                    console.error(e);
                }
                break;
            default:
                break;
        }
    }
);