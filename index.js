const directory = document.getElementById("directory");

function main() {
    loadUserscripts();

    addEventListener("message", function (e) {
        if (e.data === "userscriptSelect") {
            userscriptSelectMode();
        }
    });
}

async function loadUserscripts() {
    /** @type { { userscriptsAndMetaList: any[], documentedUserscripts: string[] }} */
    const { userscriptsAndMetaList, documentedUserscripts } =
        await fetch("userscriptsIndex.json").then(e => e.json());

    directory.innerHTML = "";

    for (const script of userscriptsAndMetaList) {
        directory.appendChild(createScriptElm(
            script,
            documentedUserscripts.includes(script.fileName)
        ));
    }
}

/**
 * @param { { fileName: string, metadata: { [x: string]: string }}} script
 * @param {boolean} hasDocumentation
 */
function createScriptElm(script, hasDocumentation) {
    const scriptElm = document.createElement("div");
    scriptElm.classList.add("script");

    const documentationFileName = script.fileName.slice(
        0, script.fileName.indexOf(".user.js")
    ) + ".html";

    {
        const scriptElmHref = document.createElement("a");
        scriptElmHref.href = "userscripts/" + script.fileName;
        scriptElm.appendChild(scriptElmHref);

        if (hasDocumentation) {
            const documentationLink = document.createElement("a");
            documentationLink.classList.add("docs");
            documentationLink.innerText = "Details...";
            documentationLink.target = "_blank";
            documentationLink.href = "docs/" + documentationFileName;
            scriptElm.appendChild(documentationLink);

            documentationLink.addEventListener("click", e => {
                // todo
                // openDocs(documentationLink.href);
                // e.preventDefault();
            });
        }

        {
            const title = document.createElement("h2");
            title.innerText = script.metadata.name;
            scriptElmHref.appendChild(title);

            const description = document.createElement("div");
            description.innerText = script.metadata.description;
            scriptElmHref.appendChild(description);
        }
    }

    return scriptElm;
}

/** @param {string} href */
function openDocs(href) {
    const iframeBackground = document.createElement("div");
    iframeBackground.classList.add("iframeBackground");
    document.body.appendChild(iframeBackground);

    const iframe = document.createElement("iframe");
    iframe.classList.add("iframe");
    iframe.src = "docs/";

    const fetchPromise = fetch(href).then(e => e.text());

    iframe.addEventListener("load", function () {
        fetchPromise.then(text =>
            iframe.contentWindow.postMessage(text, location.origin)
        );
    });

    iframeBackground.appendChild(iframe);
}

function userscriptSelectMode() {
    document.getElementById("article").classList.add("hidden");

    addEventListener("click", function (event) {
        let here = event.target;
        while (here instanceof HTMLElement) {
            if (here instanceof HTMLAnchorElement) {
                event.preventDefault();
                parent.postMessage(here.href, "*");
                return;
            }

            here = here.parentElement;
        }
    });
}


main();