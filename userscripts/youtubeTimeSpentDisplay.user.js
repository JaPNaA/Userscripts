// ==UserScript==
// @name         YouTube Time Spent Display
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.2
// @description  Displays the amount of time you've been on youtube for
// @author       JaPNaA
// @match        https://*.youtube.com/*
// @grant        none
// ==/UserScript==

(function () {
    // ignore iframes
    if (parent !== window) { return; }

    // CONFIG
    const debugMode = false;
    const resetGapTime = debugMode ? 5000 : 10 * 60e3;
    const updateInterval = debugMode ? 100 : 20e3;
    const growSpeed = debugMode ? 100 : 2;

    const localStorageKey = "tm_youtube_time_tracker_data";
    const elm = document.createElement("div");
    elm.style.cssText = `
position: fixed;
bottom: 0;
right: 0;
padding: 8px;
background-color: #000;
color: #fff;
z-index: 999;
`;
    document.body.appendChild(elm);
    // /CONFIG

    /**
     * Represents data shared across all open tabs. Handles logic and updating of values.
     */
    class Session {
        constructor() {
            /** @type {number} */
            this.expireWatcherTimeoutID = -1;
            /** @type {number} */
            this.startTime = 0;
            /** @type {number} */
            this.lastUpdated = 0;
            // this._loadSession() is called by the next method
            this._setExpireTimer();
        }

        /**
         * Reset session
         */
        reset() {
            /** @type {number} */
            this.startTime = Date.now();
            /** @type {number} */
            this.lastUpdated = Date.now();
            this._writeSession();
        }

        /**
         * Updates the lastUpdated value
         */
        update() {
            this.lastUpdated = Date.now();
            this._writeSession();
        }

        /**
         * Sets a recurring timer that might reset the time.
         * For use when a tab is in the background when the reset gap time passes.
         */
        _setExpireTimer() {
            this._loadSession();
            let timeToExpire = this.lastUpdated + resetGapTime - Date.now();
            if (timeToExpire <= 0) {
                this._maybeResetTimes();
                timeToExpire = resetGapTime;
            }

            clearTimeout(this.expireWatcherTimeoutID);
            this.expireWatcherTimeoutID = setTimeout(() => {
                this._maybeResetTimes();
                this._setExpireTimer();
            }, timeToExpire);
        }

        /**
         * Resets time if lastUpdated was longer than the resetGapTime
         */
        _maybeResetTimes() {
            this._loadSession();
            const now = Date.now();

            if (this.lastUpdated + resetGapTime < now) {
                this.reset();
            }
        }

        /**
         * Load data from local storage
         */
        _loadSession() {
            const data = this._getLocalStorage();
            if (data.startTime) {
                this.startTime = data.startTime;
            }
            if (data.lastUpdated) {
                this.lastUpdated = data.lastUpdated;
            }
        }

        /**
         * Get session data from local storage
         */
        _getLocalStorage() {
            try {
                return JSON.parse(localStorage[localStorageKey]);
            } catch (err) {
                return {};
            }
        }

        /**
         * Write session data to local storage
         */
        _writeSession() {
            localStorage[localStorageKey] = JSON.stringify({
                startTime: this.startTime,
                lastUpdated: this.lastUpdated
            });
        }
    }

    let isDocumentVisible = true;

    const session = new Session();

    update();
    setInterval(() => update(), updateInterval);
    addEventListener("visibilitychange", () => visibilityChangeHandler());
    elm.addEventListener("dblclick", () => {
        if (confirm(`Reset time spent?
Verify:
1. All YouTube tabs are closed (expect this)
2. You aren't trying to cheat the system
  a. You are doing this because the script bugged out`)) {
            session.reset();
        }
    });

    if (debugMode) {
        elm.addEventListener("contextmenu", e => {
            e.preventDefault();
            alert(localStorage[localStorageKey]);
        });
    }

    function update() {
        if (!isDocumentVisible) { return; }
        elm.innerText = getTimeStr();
        elm.style.fontSize = getFontSize() + "px";
        elm.style.padding = getFontSize() * 0.8 + "px";
        session.update();
    }

    function getTimeStr() {
        const totalMinutes = getTimeMinutes();
        const totalHours = totalMinutes / 60;

        return Math.floor(totalHours) + "hr " + Math.floor(totalMinutes % 60) + " mins";
    }

    function getFontSize() {
        const totalMinutes = getTimeMinutes();
        return totalMinutes * growSpeed + 10;
    }

    function getTimeMinutes() {
        const totalMillis = Date.now() - session.startTime;
        return totalMillis / 60e3;
    }

    function visibilityChangeHandler() {
        const isDocumentCurrVisible = document.visibilityState === "visible";

        if (isDocumentCurrVisible == isDocumentVisible) { return; }
        isDocumentVisible = isDocumentCurrVisible;

        update();
    }
})();
