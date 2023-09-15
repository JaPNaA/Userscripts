// ==UserScript==
// @name         Video Blur box
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.2
// @description  Ability to add a box to blur things
// @author       JaPNaA
// @match        file:///*/*.mp4
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    if (window["isRunningAsBookmarkletUserscript"]) {
        createBlurBox();
    } else {
        addEventListener("keydown", function (e) {
            if (e.keyCode === 66 && e.shiftKey && e.ctrlKey) {
                createBlurBox();
                e.preventDefault();
            }
        });
    }

    function createBlurBox() {
        const div = document.createElement("div");

        const resizePadding = 16;

        let stateMouseDown = false;
        let stateMouseRightDown = false;
        let stateMouseHovering = false;

        let divTop = 577;
        let divLeft = 159;
        let divWidth = 961;
        let divHeight = 105;

        let resizeLeft = false;
        let resizeRight = false;
        let resizeTop = false;
        let resizeBottom = false;

        let hideCursorTimeoutId = -1;
        let cursorHiddenByTimeout = false;

        function mouseMoveHandler(e) {
            showMouseAndHideAfterInterval();
            if (stateMouseDown) {
                if (isResizing()) {
                    if (resizeLeft) {
                        divWidth -= e.movementX;
                        divLeft += e.movementX;
                    } else if (resizeRight) {
                        divWidth += e.movementX;
                    }
                    if (resizeTop) {
                        divHeight -= e.movementY;
                        divTop += e.movementY;
                    } else if (resizeBottom) {
                        divHeight += e.movementY;
                    }
                } else {
                    divTop += e.movementY;
                    divLeft += e.movementX;
                }

                if (divWidth < resizePadding * 2) {
                    divWidth = resizePadding * 2;
                }
                if (divHeight < resizePadding * 2) {
                    divHeight = resizePadding * 2;
                }
                updateStyles();
                e.preventDefault();
                e.stopPropagation();
            } else if (stateMouseHovering) {
                updateCursorResizing(e);
                updateStyles();
                e.preventDefault();
                e.stopPropagation();
            }
        }

        function mouseUpHandler(e) {
            let shouldUpdateStyles = false;
            if (e.button === 2) {
                if (stateMouseRightDown) {
                    e.preventDefault();
                    e.stopPropagation();
                    shouldUpdateStyles = true;
                }

                stateMouseRightDown = false;
            } else {
                if (stateMouseDown) {
                    e.preventDefault();
                    e.stopPropagation();
                    shouldUpdateStyles = true;
                }

                stateMouseDown = false;
                resizeLeft = false;
                resizeRight = false;
                resizeTop = false;
                resizeBottom = false;
            }
            if (shouldUpdateStyles) {
                updateStyles();
            }
        }

        function mouseDownHandler(e) {
            e.preventDefault();
            e.stopPropagation();

            if (e.button === 2) {
                stateMouseRightDown = true;
            } else {
                stateMouseDown = true;
                updateCursorResizing(e);
            }
            updateStyles();
        }

        function updateCursorResizing(e) {
            if (e.target !== div) { return; }

            resetResizeStates();

            if (e.layerX < resizePadding) {
                resizeLeft = true;
            } else if (e.layerX > divWidth - resizePadding) {
                resizeRight = true;
            }
            if (e.layerY < resizePadding) {
                resizeTop = true;
            } else if (e.layerY > divHeight - resizePadding) {
                resizeBottom = true;
            }
        }

        function isResizing() {
            return resizeLeft || resizeRight || resizeTop || resizeBottom;
        }

        function resetResizeStates() {
            resizeLeft = false;
            resizeRight = false;
            resizeTop = false;
            resizeBottom = false;
        }

        function updateStyles() {
            div.style.top = divTop + "px";
            div.style.left = divLeft + "px";
            div.style.width = divWidth + "px";
            div.style.height = divHeight + "px";

            if (stateMouseDown) {
                div.style.backgroundColor = "#0008";
                div.style.backdropFilter = "blur(8px)";
                if (isResizing()) {
                    div.style.cursor = "move";
                } else {
                    div.style.cursor = "";
                }
            } else if (stateMouseRightDown) {
                div.style.backgroundColor = "transparent";
                div.style.backdropFilter = "";
                div.style.cursor = "none";
            } else if (cursorHiddenByTimeout) {
                div.style.backgroundColor = "transparent";
                div.style.backdropFilter = "blur(8px)";
                div.style.cursor = "none";
            } else if (isResizing()) { // && !stateMouseDown
                div.style.backgroundColor = "#0002";
                div.style.backdropFilter = "blur(8px)";
                div.style.cursor = "move";
            } else {
                div.style.backgroundColor = "transparent";
                div.style.backdropFilter = "blur(8px)";
                div.style.cursor = "";
            }
        }

        function showMouseAndHideAfterInterval() {
            clearTimeout(hideCursorTimeoutId);
            hideCursorTimeoutId = setTimeout(() => {
                cursorHiddenByTimeout = true;
                updateStyles();
            }, 1500);
            if (cursorHiddenByTimeout) {
                cursorHiddenByTimeout = false;
                updateStyles();
            }
        }

        function remove() {
            document.body.removeChild(div);
            removeEventListener("mouseup", mouseUpHandler);
            removeEventListener("mousemove", mouseMoveHandler);
        }

        div.addEventListener("mousedown", mouseDownHandler);
        div.addEventListener("dblclick", remove);
        div.addEventListener("contextmenu", e => e.preventDefault());
        div.addEventListener("mouseleave", () => {
            stateMouseHovering = false;
            if (!stateMouseDown) {
                resetResizeStates();
                updateStyles();
            }
            if (stateMouseRightDown) {
                stateMouseRightDown = false;
                updateStyles();
            }
        });
        div.addEventListener("mouseenter", () => { stateMouseHovering = true });
        addEventListener("mouseup", mouseUpHandler);
        addEventListener("mousemove", mouseMoveHandler);


        div.style.position = "fixed";
        div.style.backgroundColor = "transparent";
        div.style.backdropFilter = "blur(8px)";
        div.style.zIndex = "999";
        div.style.transition = "0.15s ease background-color";

        updateStyles();
        document.body.appendChild(div);
    }
})();
