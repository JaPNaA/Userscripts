// ==UserScript==
// @name         Github 4 space tabs
// @version      0.1
// @description  Sets the tab width to 4
// @author       JaPNaA
// @match        https://github.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const elms = document.querySelectorAll("[data-tab-size]");

    for (const elm of elms) {
        elm.dataset.tabSize = "4";
    }
})();