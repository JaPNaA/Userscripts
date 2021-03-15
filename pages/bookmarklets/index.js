import userscriptMetadata from "../../commmon/userscriptMetadata.js";

/** @type {HTMLTextAreaElement} */ // @ts-ignore
const userscriptsInputDiv = document.getElementById("userscriptsInput");
/** @type {HTMLButtonElement} */ // @ts-ignore
const addUserscriptButton = document.getElementById("add");
/** @type {HTMLInputElement} */ // @ts-ignore
const nameInput = document.getElementById("name");
/** @type {HTMLAnchorElement} */ // @ts-ignore
const outputAnchor = document.getElementById("output");

let inputtedName = undefined;
let placeholderName = "";

function main() {
    addUserscriptButton.addEventListener("click", function () {
        new UserscriptTextarea().appendToUserscriptInputDiv();
    });

    nameInput.addEventListener("input", function () {
        inputtedName = nameInput.value;
        updateName();
    });

    /** @type {HintDialogue} */
    let existingHintDialogue;

    outputAnchor.addEventListener("click", function (e) {
        e.preventDefault();

        if (existingHintDialogue) { return; }
        existingHintDialogue = new HintDialogue(
            outputAnchor, "Do not click,\nDRAG the link into your Bookmarks bar."
        );
    });

    outputAnchor.addEventListener("mousedown", function () {
        if (!existingHintDialogue) { return; }
        existingHintDialogue.remove();
        existingHintDialogue = undefined;
    });

    const firstUserscriptTextarea = new UserscriptTextarea();
    firstUserscriptTextarea.appendToUserscriptInputDiv();

    if (location.hash) {
        const autoloadSrc = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
        userscriptTextreaImportFromURL(firstUserscriptTextarea, autoloadSrc);
    }
}

/**
 * @param {UserscriptTextarea} userscriptTextrea 
 * @param {string} src 
 */
function userscriptTextreaImportFromURL(userscriptTextrea, src) {
    userscriptTextrea.textarea.value = "Auto importing from `" + src + "`...";
    fetchText(src)
        .then(text => {
            if (text) {
                userscriptTextrea.textarea.value = text || "Failed to auto import:\nEmpty response";
                userscriptTextrea._inputHandler();
            } else {
                userscriptTextrea.textarea.value = "Failed to auto import:\nEmpty response";
            }
        })
        .catch(err => userscriptTextrea.textarea.value = "Failed to auto import:\n" + err);
}

/** @param {string} src */
function fetchText(src) {
    return fetch(src).then(e => e.text());
}

function updateName() {
    let name;
    if (inputtedName && inputtedName.trim()) {
        name = inputtedName;
    } else {
        name = placeholderName.trim() || "My bookmarklet";
    }

    nameInput.placeholder = name;
    outputAnchor.innerText = name;
}

/** @param {string[]} userscripts */
function processInput(userscripts) {
    const allNames = [];
    const allIncludes = [];

    for (const userscript of userscripts) {
        /** @type {Map<string, string>} */
        let metadata;
        try {
            metadata = userscriptMetadata.parseFrom(userscript);
        } catch (err) {
            metadata = new Map();
        }

        const userscriptName = metadata.get("name");
        if (userscriptName) {
            allNames.push(userscriptName);
        }

        const matchesAndIncludes = [];
        const matches = metadata.get("match");
        const includes = metadata.get("include");
        const excludes = metadata.get("exclude");

        arrayAdd(matchesAndIncludes, matches);
        arrayAdd(matchesAndIncludes, includes);
        allIncludes.push([matchesAndIncludes, arrayAdd([], excludes)]);
    }

    if (allNames.length > 0 && !inputtedName) {
        placeholderName = allNames.join(" + ");
    }

    return `javascript:(function() {
    const userscripts = ${JSON.stringify(userscripts)};
    const includes = ${JSON.stringify(allIncludes)};
    const ranCheckKey = ${Math.random()} + "-" + ${Date.now()} + "-userscripts-ran";
    const len = userscripts.length;

    function run() {
        if (window[ranCheckKey]) {
            if (!confirm("Are you sure you want to run the userscripts again?")) {
                return;
            }
        }

        window[ranCheckKey] = true;

        for (let i = 0; i < len; i++) {
            const userscript = userscripts[i];
            const includeData = includes[i];

            if (!doesMatch(includeData, location.href)) { continue; }

            try {
                window.eval(userscript);
            } catch (err) { console.error(err); }
        }
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

    const specialCharacters = [
        "\\\\", ".", "+", "?", "^", "$", "(", ")", "[", "]", "{", "}", "|"
    ];
    const specialCharactersRegex = specialCharacters.map(c => new RegExp("\\\\" + c, "g"));

    function patternStrToRegex(pattern) {
        let regexStr = pattern;
        for (let i = 0; i < specialCharacters.length; i++) {
            specialChar = specialCharacters[i];
            specialCharRegexp = specialCharactersRegex[i];
            regexStr = regexStr.replace(specialCharRegexp, "\\\\" + specialChar);
        }
        return new RegExp("^" + regexStr.replace(/\\*/g, ".*") + "$", "i");
    }

    run();
}());`;
}

/**
 * @template T
 * @param {T[]} arr 
 * @param {T | T[] | undefined} elm 
 */
function arrayAdd(arr, elm) {
    if (!elm) { return arr; }
    if (Array.isArray(elm)) {
        for (const i of elm) {
            arr.push(i);
        }
    } else {
        arr.push(elm);
    }

    return arr;
}


class UserscriptTextarea {
    constructor() {
        this.container = document.createElement("div");
        this.container.classList.add("userscriptTextareaContainer");

        this.textarea = document.createElement("textarea");
        this.container.appendChild(this.textarea);

        this.textarea.addEventListener("input", () => this._inputHandler());

        this.importButtonContainer = document.createElement("div");
        this.importButtonContainer.classList.add("importButtonContainer");

        this.importButton = document.createElement("button");
        this.importButton.classList.add("import");
        this.importButton.innerText = "Import from...";
        this.importButtonContainer.appendChild(this.importButton);

        /** @type {HintDialogue} */
        this.existingHintDialogue = undefined;

        this.importButton.addEventListener("click", () => {
            if (this.existingHintDialogue) { return; }
            const importDialogue = new UserscriptTextareaImportDialogue();
            this.existingHintDialogue = new HintDialogue(this.importButtonContainer,
                importDialogue.getElm()
            );

            this.attachToImportPromise(importDialogue.waitForImport());
        });

        this.container.appendChild(this.importButtonContainer);

        UserscriptTextarea.all.push(this);
    }

    static getAllInputs() {
        return UserscriptTextarea.all.map(
            userscriptTextarea => userscriptTextarea.textarea.value
        );
    }

    /** @param {Promise<string>} promise */
    attachToImportPromise(promise) {
        promise.then(e => {
            this._removeHintDialogue();
            if (!e) {
                alert("Failed to import - request failed or returned empty");
                return;
            }
            this.textarea.value = e;
            this._inputHandler();
        }).catch(e => {
            this._removeHintDialogue();
            alert("Failed to import - request failed\n" + e);
        });
    }

    appendToUserscriptInputDiv() {
        userscriptsInputDiv.appendChild(this.container);
    }

    _inputHandler() {
        outputAnchor.href = processInput(UserscriptTextarea.getAllInputs());
        updateName();

        if (this.textarea.value !== "") {
            this.importButton.classList.add("hide");
            this._removeHintDialogue();
        } else {
            this.importButton.classList.remove("hide");
        }
    }

    _removeHintDialogue() {
        if (this.existingHintDialogue) {
            this.existingHintDialogue.remove();
            this.existingHintDialogue = undefined;
        }
    }
}

/** @type {UserscriptTextarea[]} */
UserscriptTextarea.all = [];

class UserscriptTextareaImportDialogue {
    constructor() {
        this.elm = document.createElement("div");
        this.elm.classList.add("userscriptTextareaImportDialogue");

        this.fromURLOption = document.createElement("button");
        this.fromURLOption.innerText = "Url...";
        this.elm.appendChild(this.fromURLOption);

        this.fromJaPNaAOption = document.createElement("button");
        this.fromJaPNaAOption.innerText = "JaPNaA...";
        this.elm.appendChild(this.fromJaPNaAOption);

        this.fromPaste = document.createElement("button");
        this.fromPaste.innerText = "Paste";
        this.elm.appendChild(this.fromPaste);
    }

    waitForImport() {
        return new Promise(res => {
            this.fromURLOption.addEventListener("click", () => {
                const url = prompt("Enter URL");
                if (!url) { return; }
                res(fetchText(url));
            });

            this.fromJaPNaAOption.addEventListener("click", () => {
                const frame = new JaPNaAUserscriptsIFrame();
                res(
                    frame.waitForSelection()
                        .then(url => fetchText(url))
                );
            });

            this.fromPaste.addEventListener("click", () => {
                const readClipboardPromise = navigator.clipboard.readText();
                readClipboardPromise.catch(() => {
                    alert("Failed to read from clipboard. Try using ctrl-v on the textarea instead.");
                });
                res(readClipboardPromise);
            });
        })
    }

    getElm() {
        return this.elm;
    }
}

class JaPNaAUserscriptsIFrame {
    constructor() {
        this.container = document.createElement("div");
        this.container.classList.add("iframeBackground");

        this.iframe = document.createElement("iframe");
        this.iframe.classList.add("iframe");
        this.iframe.src = "../../";
        this.container.appendChild(this.iframe);

        this.iframe.addEventListener("load", () => {
            this.iframe.contentWindow.postMessage("userscriptSelect", location.origin);
        });

        document.body.appendChild(this.container);
    }

    waitForSelection() {
        return new Promise(res => {
            addEventListener("message", e => {
                if (e.origin !== location.origin) { return; }
                res(e.data);
                this.remove();
            }, { once: true });
        });
    }

    remove() {
        document.body.removeChild(this.container);
    }
}

class HintDialogue {
    /**
     * @param {HTMLElement} anchorElm
     * @param {string | HTMLElement} message
     */
    constructor(anchorElm, message) {
        this.elm = document.createElement("div");
        this.elm.classList.add("hintDialogue");
        if (typeof message === "string") {
            this.elm.innerText = message;
        } else {
            this.elm.appendChild(message);
        }

        this.container = document.createElement("div");
        this.container.appendChild(this.elm);
        this.container.classList.add("hintDialogueContainer");

        this.anchorElm = anchorElm;

        anchorElm.appendChild(this.container);
    }

    remove() {
        this.anchorElm.removeChild(this.container);
    }
}

main();
