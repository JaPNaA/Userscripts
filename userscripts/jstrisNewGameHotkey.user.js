// ==UserScript==
// @name         JSTris new game hotkey
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.1
// @description  Adds Enter to create new game
// @author       You
// @match        https://jstris.jezevec10.com/*
// @grant        none
// ==/UserScript==

(function () {
    addEventListener("keydown", e => e.keyCode === 13 && document.querySelector("#res").click());
})();
