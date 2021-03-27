// @ts-ignore
window.isRunningAsBookmarkletUserscript = true;

for (const userscript of [/* userscripts */]) {
    try {
        window.eval(userscript);
    } catch (err) { console.error(err); }
}

// @ts-ignore
delete window.isRunningAsBookmarkletUserscript;
