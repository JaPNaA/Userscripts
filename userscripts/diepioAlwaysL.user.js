// ==UserScript==
// @name         Always L
// @namespace    https://japnaa.github.io/Userscripts/
// @version      1.3
// @description  Holds L for you in diep.io
// @author       JaPNaA
// @match        *://diep.io/*
// @grant        none
// ==/UserScript==

(function() {
	var isActive = true;

	function f(e){
		if (!isActive) return;
		var a = new KeyboardEvent("keydown", {
			bubbles: true,
			cancelable: true,
			shiftKey: false
		});
		delete a.keyCode;
		Object.defineProperty(a, "keyCode", {
			"value": 76
		});
		dispatchEvent(a);
	}
	function a(e) {
		addEventListener(e, f);
	}

	for (var i of ["focus", "blur", "keyup"]) {
		a(i);
	}

	addEventListener("keydown", function(e) {
		if (e.keyCode == 76 && e.isTrusted) {
			isActive ^= true;
		}
	});
}());
