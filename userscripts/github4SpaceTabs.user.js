// ==UserScript==
// @name         Github 4 space tabs
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.2
// @description  Sets the tab width to 4
// @author       JaPNaA
// @match        https://github.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
    const body = document.body;
    let timeoutHandle = -1;

    function updateElm() {
        disconnect();

        const elms = document.querySelectorAll("[data-tab-size]");

        for (const elm of elms) {
            elm.dataset.tabSize = "4";
        }

        observe();
    }

    function updateElmOnTimeout() {
        clearTimeout(timeoutHandle);
        timeoutHandle = setTimeout(function () {
            updateElm();
        }, 100);
    }

    const observer = new MutationObserver(function () {
        updateElmOnTimeout();
    });

    function observe() {
        observer.observe(body, {
            childList: true,
            subtree: true,
            attributes: false
        });
    }

    function disconnect() {
        observer.disconnect();
    }

    updateElm();
    observe();
})();
