const forAllUserscriptFiles = require("./_forAllUserscriptFiles");
const userscriptMetadata = require("./_userscriptMetadata");

const fs = require("fs");

forAllUserscriptFiles(processFile);

/**
 * @param {string} contents 
 * @param {string} fileName
 * @param {string} filePath
 */
function processFile(contents, fileName, filePath) {
    const map = userscriptMetadata.parseFrom(contents);
    map.set("namespace", "https://japnaa.github.io/Userscripts/");
    fs.writeFile(
        filePath,
        userscriptMetadata.replaceMetadata(contents, map),
        () => { }
    );
}
