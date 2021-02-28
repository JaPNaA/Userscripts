// ==UserScript==
// @name         Duolingo play hotkey
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.1
// @description  alt-r to replay audio
// @author       JaPNaA
// @match        *://www.duolingo.com/*
// @grant        none
// ==/UserScript==

(function () {
    // allow console.log-s
    window.verbose = true;
    console.log("Duolingo play hotkey userscript is active");

    addEventListener("keydown", function (e) {
        if (e.keyCode === 82 && e.altKey) {
            const challengeElm = getChallengeElm();
            if (!challengeElm) { return; }

            const button = challengeElm.querySelector("button:not([disabled])");

            if (!button) { return; }
            button.click();
        }
    });

    function getChallengeElm() {
        const possibleChallenges = document.querySelectorAll("[data-test]");
        for (let i = 0, length = possibleChallenges.length; i < length; i++) {
            const attr = possibleChallenges[i].getAttribute("data-test");
            if (attr && attr.startsWith("challenge")) {
                return possibleChallenges[i];
            }
        }
    }
})();