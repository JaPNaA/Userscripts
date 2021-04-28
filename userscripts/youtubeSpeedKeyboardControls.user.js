// ==UserScript==
// @name         YouTube speed keyboard controls
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.1
// @description  Adds keyboard controls for playback rate
// @author       JaPNaA
// @match        https://*.youtube.com/*
// @match        https://*.youtube-nocookie.com/*
// @match        https://youtube.googleapis.com/embed/*
// @grant        none
// ==/UserScript==

(function () {
    let sI = -1;

    addEventListener("keydown", function (e) {
        'use strict';

        const video = document.querySelector("video");
        if (!video) { return; }

        if (e.keyCode === 219) {
            video.playbackRate -= 0.25;
        } else if (e.keyCode === 221) {
            video.playbackRate += 0.25;
        } else {
            return;
        }

        const ytpBezelTextWrapper = document.querySelector(".ytp-bezel-text-wrapper");
        const ytpBezelText = document.querySelector(".ytp-bezel-text-wrapper .ytp-bezel-text");
        const ytpBezel = document.querySelector(".ytp-bezel");
        ytpBezelText.innerText = video.playbackRate + "x";
        ytpBezel.style.display = "none";
        ytpBezelTextWrapper.parentElement.style.display = "block";
        ytpBezelTextWrapper.parentElement.classList.remove("ytp-bezel-text-hide");

        clearTimeout(sI);
        sI = setTimeout(function () {
            ytpBezelTextWrapper.parentElement.style.display = "none";
            ytpBezel.style.display = "block";
        }, 1000);
    });

}());