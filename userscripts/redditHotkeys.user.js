// ==UserScript==
// @name         Reddit Hotkeys
// @version      0.1
// @description  Hotkeys for reddit
// @author       You
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    let redditURL;

    // maps a key to a function  (url: string) => string?
    const keyActionMap = {
        // a
        65: all,
        // b
        66: () => { history.back(); window.close(); },
        // h
        72: home,
        // n
        78: nextListing,
        // o
        79: toggleNewOld,
        // r
        82: randomSubreddit,
        // t
        84: topPosts
    };

    // overrides map above when holding shift
    const shiftKeyActionMap = {
        // A
        65: url => topPosts(all(url), "day"),
        // H
        72: url => topPosts(home(url)),
        // R
        82: url => topPosts(randomSubreddit(url)),
        // T
        84: url => topPosts(url, "day")
    };

    // keys that are still work even if not on reddit
    const extendedKeys = [
        66, // b -> back
        72, // h -> home
        82, // r -> random
    ];

    if (isReddit(location.href)) {
        registerRedditHotkeys();
    } else if (document.referrer && isReddit(document.referrer)) {
        registerExtendedHotkeys();
        redditURL = document.referrer;
    } else {
        return;
    }

    function isReddit(url) {
        return /https?:\/\/.+\.reddit\.com(\/|$).*/.test(url);
    }

    function getRedditURL() {
        return redditURL || location.href;
    }


    function registerRedditHotkeys() {
        addEventListener("keydown", function (e) {
            if (shouldIgnoreKeyboardEvent(e)) { return; }
            runAction(getActionForKeyboardEvent(e));
        });
    }

    function registerExtendedHotkeys() {
        addEventListener("keydown", function (e) {
            if (shouldIgnoreKeyboardEvent(e) || !extendedKeys.includes(e.keyCode)) { return; }
            runAction(getActionForKeyboardEvent(e));
        });
    }


    function shouldIgnoreKeyboardEvent(e) {
        return e.ctrlKey || e.altKey || ["TEXTAREA", "INPUT"].includes(e.target.tagName);
    }

    function getActionForKeyboardEvent(e) {
        let action = keyActionMap[e.keyCode];

        if (e.shiftKey) {
            action = shiftKeyActionMap[e.keyCode] || action;
        }

        return action;
    }

    function runAction(action) {
        if (action) {
            const url = action(getRedditURL());

            if (url) {
                location.assign(url);
            }
        }
    }


    function toggleNewOld(url) {
        const { protocol, subdomain, path } = getRedditURLData(url);

        let newSubdomain;
        if (subdomain === "old") {
            newSubdomain = "www";
        } else {
            newSubdomain = "old";
        }

        return "https://" + newSubdomain + ".reddit.com/" + path;
    }

    function randomSubreddit(url) {
        const { subdomain } = getRedditURLData(url);
        return "https://" + subdomain + ".reddit.com/r/random";
    }

    function home(url) {
        const { subdomain } = getRedditURLData(url);
        return "https://" + subdomain + ".reddit.com/";
    }

    function all(url) {
        const { subdomain } = getRedditURLData(url);
        return "https://" + subdomain + ".reddit.com/r/all";
    }

    function topPosts(url, ofTime) {
        const match = url.match(/(https?:\/\/[^.]+\.reddit\.com\/r\/[^\/]+)/);

        if (!match) {
            const { subdomain } = getRedditURLData(url);
            return "https://" + subdomain + ".reddit.com/top/?sort=top&t=" + (ofTime || "day");
        }

        const subredditHref = match[1];
        return subredditHref + "/top/?sort=top&t=" + (ofTime || "all");
    }

    function getRedditURLData(url) {
        const match = url.match(/(https?):\/\/([^.]+)\.reddit\.com\/(.*)/);
        return {
            protocol: match[1],
            subdomain: match[2],
            path: match[3]
        };
    }

    function nextListing(url) {
        const things = document.querySelectorAll("#siteTable .thing:not(.promoted)");
        const lastThing = things[things.length - 1];

        if (!lastThing) { return; }

        const lastThingId = lastThing.dataset.fullname;
        const searchParams = new URLSearchParams(location.search);

        const currCount = parseInt(searchParams.get("count")) || 0;
        const listingLength = things.length;

        searchParams.set("count", currCount + listingLength);
        searchParams.set("after", lastThingId);

        return location.href.slice(0, location.href.indexOf("?")) + "?" + searchParams.toString();
    }
})();