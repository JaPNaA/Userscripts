// ==UserScript==
// @name         Reddit Stay on old
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://old.reddit.com/*
// @grant        none
// ==/UserScript==

(function () {
    const regex = /^https?:\/\/www\.reddit\.com\/(.*)/;

    addEventListener("click", function (e) {
        const ahref = getAHrefParent(e.target);
        if (!ahref) { return; }
        const match = ahref.href.match(regex);
        if (!match) { return; }
        ahref.href = "https://old.reddit.com/" + match[1];
    });

    function getAHrefParent(elm) {
        let curr = elm;

        while (curr) {
            if (curr.tagName === "A" && curr.href) {
                return curr;
            }

            curr = curr.parentElement;
        }

        return null;
    }
})();