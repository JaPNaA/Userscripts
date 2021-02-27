const PATH_USERSCRIPTS = "userscripts/";

const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(PATH_USERSCRIPTS);

/** @typedef {(contents: string, fileName: string) => any} ProcessFileFunction */

/** @param {ProcessFileFunction} processFile */
function forAllUserscriptFiles(processFile) {
    const processingPromises = [];

    for (const file of files) {
        processingPromises.push(processFileWrapper(file, processFile));
        if (!file.endsWith(".user.js")) {
            console.log("Potentially unwanted file in userscripts directory:", file);
        }
    }

    return Promise.all(processingPromises);
}

/**
 * @param {string} fileName 
 * @param {ProcessFileFunction} processFile 
 */
async function processFileWrapper(fileName, processFile) {
    const contents = (await fs.promises.readFile(path.join(PATH_USERSCRIPTS, fileName))).toString();
    processFile(contents, fileName);
}

module.exports = forAllUserscriptFiles;