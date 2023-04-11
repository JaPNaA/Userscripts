(function () {
    const userscripts = [/* userscripts */];
    const includes = [/* allIncludes */];
    const ranCheckKey = "[/* random */]" + "-" + "[/* time */]" + "-userscripts-ran";
    const len = userscripts.length;

    function run() {
        if (window[ranCheckKey]) {
            if (!confirm("Are you sure you want to run the userscripts again?")) {
                return;
            }
        }

        window[ranCheckKey] = true;

        // @ts-ignore
        window.isRunningAsBookmarkletUserscript = true;

        for (let i = 0; i < len; i++) {
            const userscript = userscripts[i];
            const includeData = includes[i];

            if (!doesMatch(includeData, location.href)) { continue; }

            try {
                window.eval(userscript);
            } catch (err) { console.error(err); }
        }

        // @ts-ignore
        delete window.isRunningAsBookmarkletUserscript;
    }

    function doesMatch(includesData, url) {
        const [includes, excludes] = includesData;

        for (const exclude of excludes) {
            if (patternMatchesURL(exclude, url)) {
                return false;
            }
        }

        for (const include of includes) {
            if (patternMatchesURL(include, url)) {
                return true;
            }
        }

        return includes.length === 0;
    }

    function patternMatchesURL(pattern, url) {
        let regex;

        if (pattern.startsWith("/") && pattern.endsWith("/")) {
            regex = new RegExp(pattern.slice(1, -1));
        } else {
            regex = patternStrToRegex(pattern);
        }

        return regex.test(url);
    }

    const specialCharacters = Array.from("\\.+?^$()[]{}|");
    const specialCharactersRegex = specialCharacters.map(c => new RegExp("\\" + c, "g"));

    function patternStrToRegex(pattern) {
        let regexStr = pattern;
        for (let i = 0; i < specialCharacters.length; i++) {
            const specialChar = specialCharacters[i];
            const specialCharRegexp = specialCharactersRegex[i];
            regexStr = regexStr.replace(specialCharRegexp, "\\" + specialChar);
        }
        return new RegExp("^" + regexStr.replace(/\*/g, ".*") + "$", "i");
    }

    run();
}());
