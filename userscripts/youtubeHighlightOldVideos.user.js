// ==UserScript==
// @name         YouTube Highlight Old Videos
// @namespace    https://japnaa.github.io/Userscripts/
// @version      1.1
// @description  Highlights videos that are 8+ years old
// @author       JaPNaA
// @match        *://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    const body = document.body;
    let timeoutHandle = -1;

    function updateElm() {
        disconnect();

        const elms = document.querySelectorAll("div#metadata-line > span.style-scope.ytd-video-meta-block:nth-child(2)");

        for (const elm of elms) {
            if (elm.offsetParent === null) { continue; } // ignore if not visible

            const match = elm.innerText.match(/(\d+) years ago/);
            if (!match) { rm(elm); continue; }

            const numYears = parseInt(match[1]);

            if (numYears >= 5) {
                add(elm);
            } else {
                rm(elm);
            }
        }

        observe();
    }

    function rm(elm) {
        elm.classList.remove("tm-old-highlighted");
    }

    function add(elm) {
        elm.classList.add("tm-old-highlighted");
    }

    // css
    (function () {
        const css = document.createElement("style");
        css.innerHTML = `
.tm-old-highlighted {
    background-color: rgba(123, 123, 123, 0.25);
    border-radius: 2px;
    padding: 0 2px;
}
`;
        document.head.appendChild(css);
    }());

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