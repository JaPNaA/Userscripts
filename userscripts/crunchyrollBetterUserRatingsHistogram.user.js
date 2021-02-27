// ==UserScript==
// @name         Crunchyroll better user ratings histogram
// @namespace    https://japnaa.github.io/Userscripts/
// @version      0.1
// @description  Improves on Crunchyroll's ratings historgram on anime titles
// @author       someRandomGuy
// @match        https://www.crunchyroll.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const ratingsHistogram = document.querySelector(".rating-histogram");

    if (!ratingsHistogram) { console.log("canceled upgrade histogram"); return; }

    const style = document.createElement("style");
    style.innerHTML = `

.rating-histogram .rating-proportion {
  display: inline-block;
  border-right: 1px solid rgba(255, 255, 255, 0.10);
  box-sizing: border-box;
}

.rating-histogram .rating-bar {
  background-color: transparent;
}

.rating-histogram .rating-proportion.zero {
  display: none;
}

.rating-histogram .rating-proportion:nth-child(1) { background-color: #0ff500; }
.rating-histogram .rating-proportion:nth-child(2) { background-color: #c0f912; }
.rating-histogram .rating-proportion:nth-child(3) { background-color: #dcc628; }
.rating-histogram .rating-proportion:nth-child(4) { background-color: #da8328; }
.rating-histogram .rating-proportion:nth-child(5) { background-color: #dc2c2c; border-right: none; }

.rating-histogram .cf:not(.first-star-cf) { display: none; }

.first-star-cf .left:not(.firstRatingBar) { display: none; }

.firstRatingBar {
  display: inline-block;
  white-space: nowrap;
}

.firstRatingBar::after {
  content: attr(totalnumratings) ' ratings';
  display: inline-block;
  width: 100%;
  position: absolute;
  margin-left: 4px;
}

.first-star-cf {
  margin-bottom: 4px;
}

`;
    document.head.appendChild(style);


    setTimeout(function () {
        // wait for crunchyroll's inline script to run

        const ratingProportions = ratingsHistogram.querySelectorAll(".rating-proportion");
        const firstRatingBar = ratingProportions[0].parentElement;

        let totalNumRatings = 0;

        for (let i = 0, len = ratingProportions.length; i < len; i++) {
            const ratingProportion = ratingProportions[i];

            const numRatings = ratingProportion.parentElement.nextElementSibling.innerText.slice(1, -1);

            const numRatingsParsed = parseInt(numRatings);
            if (!isNaN(numRatingsParsed)) {
                totalNumRatings += numRatingsParsed;
            }

            ratingProportion.setAttribute(
                "title",
                ratingProportion.parentElement.previousElementSibling.innerText + " stars: " +
                numRatings + " ratings"
            );

            if (numRatingsParsed === 0) {
                ratingProportion.classList.add("zero");
            }

            firstRatingBar.appendChild(ratingProportion);
        }

        firstRatingBar.classList.add("firstRatingBar");
        firstRatingBar.setAttribute("totalnumratings", totalNumRatings.toString());
        firstRatingBar.parentElement.classList.add("first-star-cf");
    }, 1000);
})();
