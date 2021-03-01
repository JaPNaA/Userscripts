/** @type {HTMLTextAreaElement} */ // @ts-ignore
const userscriptsInputDiv = document.getElementById("userscriptsInput");
/** @type {HTMLButtonElement} */ // @ts-ignore
const addUserscriptButton = document.getElementById("add");
/** @type {HTMLInputElement} */ // @ts-ignore
const nameInput = document.getElementById("name");
/** @type {HTMLAnchorElement} */ // @ts-ignore
const outputAnchor = document.getElementById("output");

function main() {
    new UserscriptTextarea().appendToUserscriptInputDiv();

    addUserscriptButton.addEventListener("click", function () {
        new UserscriptTextarea().appendToUserscriptInputDiv();
    });

    nameInput.addEventListener("input", function () {
        outputAnchor.innerText = nameInput.value;
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
}

/** @param {string[]} code */
function processInput(code) {
    return `javascript:(function() {
    const userscripts = ${JSON.stringify(code)};
    for (const userscript of userscripts) {
        try {
            eval(userscript);
        } catch (err) { console.error(err); }
    }
}());`;
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

            importDialogue.waitForImport().then(e => {
                this.textarea.value = e;
                this._inputHandler();
            });
        });

        this.container.appendChild(this.importButtonContainer);

        UserscriptTextarea.all.push(this);
    }

    static getAllInputs() {
        return UserscriptTextarea.all.map(
            userscriptTextarea => userscriptTextarea.textarea.value
        );
    }

    appendToUserscriptInputDiv() {
        userscriptsInputDiv.appendChild(this.container);
    }

    _inputHandler() {
        outputAnchor.href = processInput(UserscriptTextarea.getAllInputs());
        if (this.textarea.value !== "") {
            this.importButton.classList.add("hide");
            if (this.existingHintDialogue) {
                this.existingHintDialogue.remove();
                this.existingHintDialogue = undefined;
            }
        } else {
            this.importButton.classList.remove("hide");
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

    }

    waitForImport() {
        return new Promise(res => {
            this.fromURLOption.addEventListener("click", () => {
                const url = prompt("Enter URL");
                res(fetch(url).then(e => e.text()));
            });

            this.fromJaPNaAOption.addEventListener("click", () => {
                const frame = new JaPNaAUserscriptsIFrame();
                res(frame.waitForSelection()
                    .then(url => fetch(url))
                    .then(e => e.text()));
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
        this.container.classList.add("JaPNaAUserscriptsIframeContainer");

        this.iframe = document.createElement("iframe");
        this.iframe.classList.add("JaPNaAUserscriptsIframe");
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
