// ==UserScript==
// @name         Crunchyroll Simulcast Calendar Button
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.1
// @description  Adds a button to access /simulcastcalendar
// @author       someUsername24
// @match        *://www.crunchyroll.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const menubar = document.querySelector("#header_menubar_beta > ul");

    const li = document.createElement("li");

    const ahref = document.createElement('a');
    ahref.href = "/simulcastcalendar";
    ahref.title = "Simulcast Calendar, Alt+Click to go to premium";

    ahref.innerHTML = "Calendar";
    ahref.classList.add("tm_calendarButtonLink");

    ahref.addEventListener("click", function (e) {
        if (!e.isTrusted) { return; }
        if (e.altKey) {
            e.preventDefault();

            if (e.ctrlKey) { // expect new tab
                open("/simulcastcalendar?filter=premium");
            } else {
                ahref.href = "/simulcastcalendar?filter=premium";
                ahref.click();
            }
        }
    });

    li.appendChild(ahref);
    li.classList.add("tm_calendarButton");

    menubar.insertBefore(li, menubar.children[1]);
})();