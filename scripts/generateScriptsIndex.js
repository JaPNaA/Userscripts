const PATH_USERSCRIPTS = "userscripts/";
const PATH_OUTPUT_INDEX_FILE = "userscriptsIndex.json";
const METADATA_KEYS_TO_KEEP = ["name", "description"];

const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(PATH_USERSCRIPTS);

const processingPromises = [];
const userscriptsAndMetaList = [];

for (const file of files) {
    processingPromises.push(processFile(file));
    if (!file.endsWith(".user.js")) {
        console.log("Potentially unwanted file in userscripts directory:", file);
    }
}

Promise.all(processingPromises).then(() => writeOutIndex());

/** @param {string} file */
async function processFile(file) {
    const contents = (await fs.promises.readFile(path.join(PATH_USERSCRIPTS, file))).toString();
    const metadata = getUserscriptMetadata(contents);
    const metadataToKeep = {};

    if (!metadata.has("name")) {
        metadata.set("name", file);
    }

    for (const key of METADATA_KEYS_TO_KEEP) {
        if (metadata.has(key)) {
            metadataToKeep[key] = metadata.get(key);
        }
    }

    userscriptsAndMetaList.push({
        fileName: file,
        metadata: metadataToKeep
    });
}

const startUserscriptMetadataRegex = /\/\/\s*==UserScript==\s*\n/i;
const endUserscriptMetadataRegex = /\/\/\s*==\/UserScript==\s*\n/i;

/** @param {string} contents */
function getUserscriptMetadata(contents) {
    const startTokenMatch = contents.match(startUserscriptMetadataRegex);

    const metadataStartIndex = startTokenMatch.index + startTokenMatch[0].length;
    const metadataEndIndex = contents.match(endUserscriptMetadataRegex).index;

    const lines = contents.slice(metadataStartIndex, metadataEndIndex).split("\n");
    const metadata = new Map();

    for (const line of lines) {
        if (!line) { continue; }
        const parsed = parseMetadataLine(line);
        if (parsed) {
            metadata.set(parsed[0], parsed[1]);
        }
    }

    return metadata;
}

const metadataLinePattern = /^\s*\/\/\s*@([^\s]+)\s*(.+)$/;

/** @param {string} line */
function parseMetadataLine(line) {
    const match = line.match(metadataLinePattern);

    if (!match) {
        console.warn("Ignored line in metadata:", line);
        return;
    }

    return [match[1], match[2]];
}

function writeOutIndex() {
    userscriptsAndMetaList.sort((a, b) =>
        a.fileName > b.fileName ? 1 : -1
    );

    const str = JSON.stringify(userscriptsAndMetaList);
    fs.writeFileSync(PATH_OUTPUT_INDEX_FILE, str);
    console.log("Written out index with " + userscriptsAndMetaList.length + " userscripts");
}
