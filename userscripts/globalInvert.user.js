// ==UserScript==
// @name         Invert
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Inverts colors
// @author       JaPNaA
// @match        *://*/*
// @run-at       document-body
// @grant        none
// ==/UserScript==

(function () {
    const localStorageKey = "invertState-tmscript";
    const styleElm = document.createElement("style");

    try {
        if (window.localStorage === undefined) {
            return;
        }
    } catch (err) {
        return;
    }

    styleElm.innerHTML = `

html.invert-tmscript {
filter: invert(100%) hue-rotate(170deg) brightness(70%);
background: #000 !important;
}

html.invert-tmscript img, html.invert-tmscript video {
filter: invert(100%) hue-rotate(-170deg);
}

`;
    document.head.appendChild(styleElm);

    let enabled = false;
    let enabledFromDarkSite = false;
    let overrideAutomaticDisable = false;
    let automaticallyDisabled = false;
    let wouldAutomaticallyDisable = false;

    updateStateFromLocalStorage();

    addEventListener("keydown", function (e) {
        if (e.keyCode === 120) { // F9
            toggleState();
        }
    });

    updateState();

    addEventListener("load", function (e) {
        updateState();
    });

    function backgroundIsDark() {
        if (!document.body) { return false; }
        const elm = lastParentWithBackgroundOf(
            document.elementFromPoint(innerWidth / 2, innerHeight / 2)
        );
        if (document.documentElement.classList.contains("invert-tmscript")) {
            return false;
        }
        return isDark(getComputedStyle(elm || document.body).backgroundColor);
    }

    function isDark(rgbStr) {
        const [r, g, b, a] = rgbStrToRGB(rgbStr);
        return (1 - a) * 255 + a * ((r * 299) + (g * 587) + (b * 114)) / 1000 < 128;
    }

    function lastParentWithBackgroundOf(elm) {
        let curr = elm;
        let last;
        while (curr) {
            if (getComputedStyle(curr).backgroundColor !== "rgba(0, 0, 0, 0)") {
                last = curr;
            }
            curr = curr.parentElement;
        }

        return last;
    }

    function rgbStrToRGB(rgbStr) {
        // pattern: rgb(0, 0, 0) or rgba(0, 0, 0, 0)
        const match = rgbStr.match(/rgba?\((\d+),\s?(\d+),\s?(\d+)(,\s[\d.]+)?\)/);
        return [match[1], match[2], match[3], match[4] || 1].map(e => parseFloat(e));
    }

    function toggleState() {
        if (enabled) {
            if (automaticallyDisabled) {
                overrideAutomaticDisable = true;
            } else if (wouldAutomaticallyDisable) {
                overrideAutomaticDisable = false;

                if (enabledFromDarkSite) {
                    enabled = false;
                }
            } else {
                enabled = false;
            }

            updateState();
        } else {
            enabled = true;
            updateState();

            if (automaticallyDisabled) {
                overrideAutomaticDisable = true;
                enabledFromDarkSite = true;
                updateState();
            }
        }
    }

    function updateState() {
        if (enabled) {
            wouldAutomaticallyDisable = backgroundIsDark();
            if (wouldAutomaticallyDisable && !overrideAutomaticDisable) {
                _disable();
                automaticallyDisabled = true;
                enabledFromDarkSite = false;
            } else {
                automaticallyDisabled = false;
                _enable();
            }
        } else {
            _disable();
            enabledFromDarkSite = false;
        }
        updateLocalStorage();
    }

    function updateStateFromLocalStorage() {
        const ls = localStorage[localStorageKey] && localStorage[localStorageKey].split("");
        if (!ls) {
            updateLocalStorage();
            return;
        }

        enabled = ls[0] === '1';
        overrideAutomaticDisable = ls[1] === '1';
        enabledFromDarkSite = ls[2] === '1';
    }

    function updateLocalStorage() {
        localStorage[localStorageKey] = (
            (enabled ? "1" : "0") +
            (overrideAutomaticDisable ? "1" : "0") +
            (enabledFromDarkSite ? "1" : "0")
        );
    }

    function _enable() {
        document.documentElement.classList.add("invert-tmscript");
    }

    function _disable() {
        document.documentElement.classList.remove("invert-tmscript");
    }
})();
