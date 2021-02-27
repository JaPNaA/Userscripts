const directory = document.getElementById("directory");

function main() {
    loadUserscripts();
}

async function loadUserscripts() {
    const scripts = await fetch("userscriptsIndex.json").then(e => e.json());

    directory.innerHTML = "";

    for (const script of scripts) {
        directory.appendChild(createScriptElm(script));
    }
}

/** @param { { fileName: string, metadata: { [x: string]: string }}} script */
function createScriptElm(script) {
    const scriptElm = document.createElement("div");
    scriptElm.classList.add("script");

    {
        const scriptElmHref = document.createElement("a");
        scriptElmHref.href = "userscripts/" + script.fileName;
        scriptElm.appendChild(scriptElmHref);

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

main();