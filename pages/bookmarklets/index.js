import userscriptMetadata from "../../commmon/userscriptMetadata.js";

/** @type {HTMLTextAreaElement} */ // @ts-ignore
const userscriptsInputDiv = document.getElementById("userscriptsInput");
/** @type {HTMLButtonElement} */ // @ts-ignore
const addUserscriptButton = document.getElementById("add");
/** @type {HTMLButtonElement} */ // @ts-ignore
const copyBookmarkletButton = document.getElementById("copy");
/** @type {HTMLInputElement} */ // @ts-ignore
const nameInput = document.getElementById("name");
/** @type {HTMLAnchorElement} */ // @ts-ignore
const outputAnchor = document.getElementById("output");
/** @type {HTMLInputElement} */ // @ts-ignore
const optionMinifyCheckbox = document.getElementById("minify");
/** @type {HTMLInputElement} */ // @ts-ignore
const optionSmallWrapperCheckbox = document.getElementById("smallWrapper");

let inputtedName = undefined;
let placeholderName = "";
let optionUseSmallWrapper = optionSmallWrapperCheckbox.checked;
let optionMinify = optionMinifyCheckbox.checked;

function main() {
    addUserscriptButton.addEventListener("click", function () {
        new UserscriptTextarea().appendToUserscriptInputDiv();
    });

    copyBookmarkletButton.addEventListener("click", function () {
        if (!navigator.clipboard) {
            prompt("Copy the below:", outputAnchor.href);
            return;
        }
        navigator.clipboard.writeText(outputAnchor.href)
            .catch(err => alert("Failed to copy:\n" + err));
    });

    nameInput.addEventListener("change", function () {
        inputtedName = nameInput.value;
        updateName();
    });

    optionMinifyCheckbox.addEventListener("change", function () {
        optionMinify = optionMinifyCheckbox.checked;
        updateAnchorHref();
    });

    optionSmallWrapperCheckbox.addEventListener("change", function () {
        optionUseSmallWrapper = optionSmallWrapperCheckbox.checked;
        updateAnchorHref();
    });

    /** @type {HintDialogue | undefined} */
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

    outputAnchor.addEventListener("blur", function() {
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
    userscriptTextrea.attachToImportPromise(fetchText(src));
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

async function updateAnchorHref() {
    outputAnchor.classList.add("loading");
    copyBookmarkletButton.disabled = true;
    try {
        outputAnchor.href = await processInput(UserscriptTextarea.getAllInputs());
        outputAnchor.classList.remove("error");
        copyBookmarkletButton.disabled = false;
    } catch (err) {
        outputAnchor.classList.add("error");
    }
    outputAnchor.classList.remove("loading");
}

/** @param {string} code */
async function minifyJavascript(code) {
    if (!window.Terser) {
        eval(await fetchText("https://cdn.jsdelivr.net/npm/source-map@0.7.3/dist/source-map.js"));
        eval(await fetchText("https://cdn.jsdelivr.net/npm/terser/dist/bundle.min.js"));
    }

    return (await Terser.minify(code)).code;
}

/** @param {string[]} userscripts */
async function processInput(userscripts) {
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

    const processedUserscripts =
        optionMinify ?
            await Promise.all(userscripts.map(userscript => minifyJavascript(userscript)))
            :
            userscripts;

    const bookmarketBody = await createBookmarketBody(
        processedUserscripts,
        allIncludes,
        optionUseSmallWrapper
    );

    return "javascript:void eval(" + JSON.stringify(
        optionMinify ?
            await minifyJavascript(bookmarketBody)
            :
            bookmarketBody
    ) + ")";
}

let bookmarkWrapper = fetchText("bookmarketWrapper.js");
let bookmarkWrapperLite = fetchText("bookmarketWrapperLite.js");

/**
 * @param {string[]} userscripts 
 * @param {any[][]} allIncludes
 * @param {boolean} useSmallWrapper
 */
async function createBookmarketBody(userscripts, allIncludes, useSmallWrapper) {
    return (await (useSmallWrapper ? bookmarkWrapperLite : bookmarkWrapper))
        .replace("[/* userscripts */]", JSON.stringify(userscripts))
        .replace("[/* allIncludes */]", JSON.stringify(allIncludes))
        .replace("[/* random */]", Math.random().toString())
        .replace("[/* time */]", Date.now().toString());
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
        this.textarea.placeholder = "Insert userscript or javascript here...";
        this.container.appendChild(this.textarea);

        this.textarea.addEventListener("input", () => this._inputHandler());

        this.importButtonContainer = document.createElement("div");
        this.importButtonContainer.classList.add("importButtonContainer");

        this.importButton = document.createElement("button");
        this.importButton.classList.add("import");
        this.importButton.innerText = "Import from...";
        this.importButtonContainer.appendChild(this.importButton);

        /** @type {HintDialogue | undefined} */
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

    async _inputHandler() {
        updateAnchorHref();
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
                const readClipboardPromise = new Promise(_ => navigator.clipboard.readText());
                readClipboardPromise.catch(() => {
                    alert("Failed to read from clipboard. Try pressing Ctrl-V while the textarea is selected instead.");
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
            if (!this.iframe.contentWindow) { alert("Error -- cannot access iframe to import scripts."); return; }
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
        if (this.container.parentNode === this.anchorElm) {
            this.anchorElm.removeChild(this.container);
        }
    }
}

main();
