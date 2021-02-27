const startUserscriptMetadataRegex = /\/\/\s*==UserScript==\s*\n/i;
const endUserscriptMetadataRegex = /\/\/\s*==\/UserScript==\s*\n/i;

/** @param {string} contents */
function parse(contents) {
    const startTokenMatch = contents.match(startUserscriptMetadataRegex);

    const metadataStartIndex = startTokenMatch.index + startTokenMatch[0].length;
    const metadataEndIndex = contents.match(endUserscriptMetadataRegex).index;

    const lines = contents.slice(metadataStartIndex, metadataEndIndex).split("\n");
    const metadata = new Map();

    for (const line of lines) {
        if (!line) { continue; }
        const parsed = parseMetadataLine(line);
        if (!parsed) { continue; }
        const existingValue = metadata.get(parsed[0]);
        if (existingValue === undefined) {
            metadata.set(parsed[0], parsed[1]);
        } else if (Array.isArray(existingValue)) {
            existingValue.push(parsed[1]);
        } else {
            metadata.set(parsed[0], [existingValue, parsed[1]]);
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

const metadataPreferredOrder = [
    "name",
    "namespace",
    "version",
    "description",
    "author",
    "match",
    "include",
    "exclude",
    "run-at",
    "grant",
    "require",
    "resource",
    "compatible",
    "icon"
];
const keyColumnMarginLeft = 1;

/** @param {Map<string, string>} map */
function generateMetadataStr(map) {
    const keyColumnWidth = getKeyColumnWidth(map) + keyColumnMarginLeft;
    const lines = ["// ==UserScript=="];

    // write in preferred order
    for (const key of metadataPreferredOrder) {
        const value = map.get(key);
        if (!value) { continue; }
        lines.push(generateMetadataLine(key, keyColumnWidth, value));
    }

    // add remaining keys
    for (const [key, value] of map) {
        if (metadataPreferredOrder.includes(key)) { continue; }
        lines.push(generateMetadataLine(key, keyColumnWidth, value));
    }

    lines.push("// ==/UserScript==");
    return lines.join("\n");
}

/** @param {Map<string, string>} map */
function getKeyColumnWidth(map) {
    let longest = 0;

    for (const [key] of map) {
        if (key.length > longest) {
            longest = key.length;
        }
    }

    return longest;
}

/**
 * @param {string} key 
 * @param {number} keyColumnWidth 
 * @param {string | string[]} value 
 */
function generateMetadataLine(key, keyColumnWidth, value) {
    if (Array.isArray(value)) {
        const lines = [];
        for (const elm of value) {
            lines.push(`// @${key.padEnd(keyColumnWidth, " ")} ${elm}`);
        }
        return lines.join("\n");
    } else {
        return `// @${key.padEnd(keyColumnWidth, " ")} ${value}`;
    }
}

module.exports = { parse: parse, generateMetadataStr };

