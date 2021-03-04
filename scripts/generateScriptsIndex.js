const PATH_OUTPUT_INDEX_FILE = "userscriptsIndex.json";
const METADATA_KEYS_TO_KEEP = ["name", "description"];

import { writeFileSync, readdirSync } from "fs";

import forAllUserscriptFiles from "./_forAllUserscriptFiles.js";
import userscriptMetadata from "../commmon/userscriptMetadata.js";

const userscriptsAndMetaList = [];
const docsDirItems = readdirSync("./docs/");
const documentedUserscripts = [];

forAllUserscriptFiles(processFile).then(() => writeOutIndex());

/**
 * @param {string} contents
 * @param {string} file
 */
async function processFile(contents, file) {
    const metadata = userscriptMetadata.parseFrom(contents);
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

    addDocumentationIfExists(file);
}

/** @param {string} userscriptFilename */
function addDocumentationIfExists(userscriptFilename) {
    const userscriptName = userscriptFilename.slice(
        0, userscriptFilename.indexOf(".user.js")
    );
    if (docsDirItems.includes(userscriptName + ".html")) {
        documentedUserscripts.push(userscriptFilename);
    }
}

function writeOutIndex() {
    userscriptsAndMetaList.sort((a, b) =>
        a.fileName > b.fileName ? 1 : -1
    );

    const str = JSON.stringify({ userscriptsAndMetaList, documentedUserscripts });
    writeFileSync(PATH_OUTPUT_INDEX_FILE, str);
    console.log("Written out index with " + userscriptsAndMetaList.length + " userscripts");
}
