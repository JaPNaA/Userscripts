// ==UserScript==
// @name         Make Messy
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.1
// @description  Makes websites messy
// @author       JaPNaA
// @match        *://*/*
// @run-at       context-menu
// @grant        none
// ==/UserScript==

(function () {
    if (window.tmScriptMessy) {
        restore();
        window.tmScriptMessy = false;
    } else {
        makeMessy();
        window.tmScriptMessy = true;
    }

    function makeMessy() {
        const elms = _getAllElms();

        for (let i = 0, length = elms.length; i < length; i++) {
            const elm = elms[i];

            elm.dataset.preMessyTransform = elm.style.transform;
            elm.dataset.preMessyTransformOrigin = elm.style.transformOrigin;
            elm.dataset.preMessyOverflow = elm.style.overflow;
            elm.dataset.preMessyTransition = elm.style.transition;

            elm.style.transform = `translate(${_rand(16)}px, ${_rand(32) + innerHeight * 0.2}px) rotate(${_rand(8)}deg)`;
            elm.style.transformOrigin = "center";
            elm.style.overflow = "visible";
            elm.style.transition = `${_rand(0.8) + 0.6}s ${_rand(0.6)}s ease transform`;
        }
    }

    function restore() {
        const elms = _getAllElms();

        for (let i = 0, length = elms.length; i < length; i++) {
            const elm = elms[i];

            elm.style.transform = elm.dataset.preMessyTransform;
            elm.style.transformOrigin = elm.dataset.preMessyTransformOrigin;
            elm.style.overflow = elm.dataset.preMessyOverflow;

            setTimeout(function () {
                elm.style.transition = elm.dataset.preMessyTransition;
            }, 2000);
        }
    }

    function _getAllElms() {
        if (document.all) {
            return document.all;
        } else {
            return document.querySelectorAll("*");
        }
    }

    function _rand(s) {
        return (Math.random() - 0.5) * s;
    }
})();
