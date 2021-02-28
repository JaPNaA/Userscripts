// ==UserScript==
// @name         Reddit No Scroll Restore
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.1
// @description  try to take over the world!
// @author       JaPNaA
// @match        https://*.reddit.com/*
// @grant        none
// ==/UserScript==

(function () {
    history.scrollRestoration = "manual";
})();