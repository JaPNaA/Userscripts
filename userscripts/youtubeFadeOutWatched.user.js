// ==UserScript==
// @name         YouTube Fade Out Watched
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.2
// @description  Fades out watched videos on YouTube
// @author       JaPNaA
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    const body = document.body;
    let timeoutHandle = -1;

    function setup() {
        const style = document.createElement("style");
        style.innerHTML = `
.tm-watched {
    opacity: 0.2;
    transition: 0.15s ease opacity;
}

.tm-watched:hover {
    opacity: 0.8;
}
`;
        document.head.appendChild(style);
    }

    function updateElm() {
        disconnect();

        const elms = document.getElementsByTagName("ytd-thumbnail-overlay-resume-playback-renderer");

        for (let i = 0, length = elms.length; i < length; i++) {
            const elm = elms[i];
            const parent = getParentWithTagName(["YTD-GRID-VIDEO-RENDERER", "YTD-VIDEO-RENDERER", "YTD-COMPACT-VIDEO-RENDERER"], elm);
            if (!parent) { continue; }

            parent.classList.add("tm-watched");
        }

        const fadedOutElms = [].slice.call(document.getElementsByClassName("tm-watched"));

        for (const elm of fadedOutElms) {
            if (elm.getElementsByTagName("ytd-thumbnail-overlay-resume-playback-renderer").length <= 0) {
                elm.classList.remove("tm-watched");
            }
        }

        observe();
    }

    function getParentWithTagName(tags, elm) {
        let curr = elm;

        while (curr) {
            if (tags.includes(curr.tagName)) {
                return curr;
            }

            curr = curr.parentElement;
        }
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
    setup();
    observe();
})();