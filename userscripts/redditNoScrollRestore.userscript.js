// ==UserScript==
// @name         Reddit No Scroll Restore
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.reddit.com/*
// @grant        none
// ==/UserScript==

(function () {
    history.scrollRestoration = "manual";
})();