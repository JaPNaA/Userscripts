const PATH_USERSCRIPTS = "userscripts/";

import fs from "fs";
import path from "path";

const files = fs.readdirSync(PATH_USERSCRIPTS);

/** @typedef {(contents: string, fileName: string, filePath: string) => any} ProcessFileFunction */

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
    const filePath = path.join(PATH_USERSCRIPTS, fileName);
    const contents = (await fs.promises.readFile(filePath)).toString();
    processFile(contents, fileName, filePath);
}

export default forAllUserscriptFiles;
