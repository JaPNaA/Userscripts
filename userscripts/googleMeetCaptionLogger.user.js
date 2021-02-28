// ==UserScript==
// @name         Google Meet Caption Logger
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.1
// @description  Logs captions from Google Meet
// @author       JaPNaA
// @match        https://meet.google.com/*
// @grant        none
// ==/UserScript==

(async function () {
    function wait(time) { return new Promise(res => setTimeout(() => res(), time)); }

    if (window._dmutationObserver) { window._dmutationObserver(); }

    let target = null;

    do {
        await wait(1000);
        target = document.querySelector("c-wiz > div > div > div > div > div:nth-child(6)");
    } while (!target);

    const mutationObserver = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const added of mutation.addedNodes) {
                const target = added.children[2].children[0];
                const startTime = new Date();
                let currIndex = 0;
                const components = [];
                const unindexComponents = [];
                let printed = false;

                function updateText() {
                    if (target.innerText.length > 0) { return; }
                    const endTime = new Date();
                    console.log(
                        startTime.toLocaleTimeString() + " - " + endTime.toLocaleTimeString() + "    " + added.innerText + ":\n" +
                        unindexComponents.join("") + components.join("")
                    );
                };

                const messageObserver = new MutationObserver(childMutations => {
                    for (const childMutation of childMutations) {
                        for (const remove of childMutation.removedNodes) {
                            const componentIndex = parseInt(remove.dataset.tm_gmcl_index, 10);
                            if (isNaN(componentIndex)) {
                                unindexComponents.push(remove.innerText);
                            } else {
                                components[componentIndex] = remove.innerText;
                            }
                        }

                        for (const addedNode of childMutation.addedNodes) {
                            addedNode.dataset.tm_gmcl_index = currIndex++;
                        }
                    }

                    updateText();
                });

                messageObserver.observe(target, { childList: true, characterData: true });
            }
        }
    });
    mutationObserver.observe(target, { childList: true });

    window._dmutationObserver = () => mutationObserver.disconnect();
})();
