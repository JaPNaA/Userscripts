// ==UserScript==
// @name         Crunchyroll Theater Mode
// @version      0.1
// @description  Makes the crunchyroll viewer wide, if not already
// @author       JaPNaA
// @match        https://www.crunchyroll.com/*
// @grant        none
// ==/UserScript==

(function () {
    const videoBox = document.getElementById("showmedia_video_box");
    const sideBar = document.getElementById("sidebar");

    if (!videoBox || !videoBox.classList.contains("player-container-16-9") || !videoBox.classList.contains("player-container")) {
        return;
    }

    videoBox.classList.remove("player-container-16-9");
    videoBox.classList.add("wide-player-container-16-9");

    videoBox.classList.remove("player-container");
    videoBox.classList.add("wide-player-container");

    document.getElementById("showmedia").parentElement.classList.add("new_layout", "new_layout_wide");

    videoBox.style.zIndex = "1";
    videoBox.style.position = "relative";

    sideBar.style.marginTop = (videoBox.clientHeight + 16) + "px";
})();
