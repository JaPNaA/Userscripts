// ==UserScript==
// @name         Video Blur box
// @version      0.1
// @description  Ability to add a box to blur things
// @author       JaPNaA
// @match        file:///*/*.mp4
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    addEventListener("keydown", function (e) {
        if (e.keyCode === 66 && e.shiftKey && e.ctrlKey) {
            createBlurBox();
            e.preventDefault();
        }
    });

    function createBlurBox() {
        const div = document.createElement("div");

        const resizePadding = 12;

        let stateMouseDown = false;

        let divTop = 577;
        let divLeft = 159;
        let divWidth = 961;
        let divHeight = 105;

        let resizeLeft = false;
        let resizeRight = false;
        let resizeTop = false;
        let resizeBottom = false;

        function updatePosition() {
            div.style.top = divTop + "px";
            div.style.left = divLeft + "px";
            div.style.width = divWidth + "px";
            div.style.height = divHeight + "px";
        }

        function mouseMoveHandler(e) {
            if (!stateMouseDown) { return; }

            if (resizeLeft || resizeRight || resizeTop || resizeBottom) {
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

            updatePosition();
        }

        function mouseUpHandler(e) {
            if (e.button === 2) {
                div.style.backdropFilter = "blur(8px)";
                e.preventDefault();
                return;
            }

            stateMouseDown = false;
            resizeLeft = false;
            resizeRight = false;
            resizeTop = false;
            resizeBottom = false;
        }

        function mouseDownHandler(e) {
            if (e.button === 2) {
                div.style.backdropFilter = "";
                e.preventDefault();
                return;
            }

            stateMouseDown = true;

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

        function remove() {
            document.body.removeChild(div);
            removeEventListener("mouseup", mouseUpHandler);
            removeEventListener("mousemove", mouseMoveHandler);
        }

        div.addEventListener("mousedown", mouseDownHandler);
        div.addEventListener("dblclick", remove);
        div.addEventListener("contextmenu", e => e.preventDefault());
        addEventListener("mouseup", mouseUpHandler);
        addEventListener("mousemove", mouseMoveHandler);


        div.style.position = "fixed";
        div.style.backgroundColor = "transparent";
        div.style.backdropFilter = "blur(8px)";
        div.style.zIndex = "999";

        updatePosition();
        document.body.appendChild(div);
    }
})();
