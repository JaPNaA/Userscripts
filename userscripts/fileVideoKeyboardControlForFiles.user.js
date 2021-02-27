// ==UserScript==
// @name         Video Keyboard controls for files
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.1
// @description  Adds keyboard controls for video files
// @author       JaPNaA
// @match        file:///*/*.mp4
// @match        *://*/*.mp4
// @grant        none
// ==/UserScript==

(function () {
    if (document.body.childElementCount !== 1 || document.body.children[0].tagName !== "VIDEO") { return; }

    addEventListener("keydown", function (e) {
        const vid = document.querySelector("video");
        if (!vid) { return; }

        let time = 5;
        if (e.shiftKey) { time /= 2.5; }
        if (e.altKey) { time *= 6; }
        if (e.ctrlKey) { time = 1 / 60; }

        let capturesHere = true;

        switch (e.keyCode) {
            case 37:
                vid.currentTime -= time;
                break;
            case 39:
                vid.currentTime += time;
                break;
            default:
                capturesHere = false;
        }

        if (capturesHere) {
            e.preventDefault();
        }
    });
})();