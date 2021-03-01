import forAllUserscriptFiles from "./_forAllUserscriptFiles.js";
import userscriptMetadata from "../commmon/userscriptMetadata.js";

import { writeFile } from "fs";

forAllUserscriptFiles(processFile);

/**
 * @param {string} contents 
 * @param {string} fileName
 * @param {string} filePath
 */
function processFile(contents, fileName, filePath) {
    const map = userscriptMetadata.parseFrom(contents);
    map.set("namespace", "https://japnaa.github.io/Userscripts/");
    map.set("author", "JaPNaA");
    writeFile(
        filePath,
        userscriptMetadata.replaceMetadata(contents, map),
        () => { }
    );
}
