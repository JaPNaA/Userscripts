const PATH_OUTPUT_INDEX_FILE = "userscriptsIndex.json";
const METADATA_KEYS_TO_KEEP = ["name", "description"];

const fs = require("fs");

const forAllUserscriptFiles = require("./_forAllUserscriptFiles");
const userscriptMetadata = require("./_userscriptMetadata");

const userscriptsAndMetaList = [];

forAllUserscriptFiles(processFile).then(() => writeOutIndex());

/**
 * @param {string} contents
 * @param {string} file
 */
async function processFile(contents, file) {
    const metadata = userscriptMetadata.parse(contents);
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

function writeOutIndex() {
    userscriptsAndMetaList.sort((a, b) =>
        a.fileName > b.fileName ? 1 : -1
    );

    const str = JSON.stringify(userscriptsAndMetaList);
    fs.writeFileSync(PATH_OUTPUT_INDEX_FILE, str);
    console.log("Written out index with " + userscriptsAndMetaList.length + " userscripts");
}
