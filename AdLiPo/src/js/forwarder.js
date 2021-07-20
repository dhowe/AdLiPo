browser.runtime.onMessage.addListener(
    (data, sender) => {
        switch (data.type) {
            case "elementToReplace":
                const tabId = sender.tab.id;
                if (tabId === undefined) return;
                try {
                    let sending = webext.tabs.sendMessage(tabId, data);
                    sending.then(() => { }, (e) => { console.error((e)) });
                } catch (e) {
                    console.error(e)
                }
                break;
    
            default:
                break;
        }
    }
);