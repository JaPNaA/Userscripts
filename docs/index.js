addEventListener("message", function (event) {
    if (event.origin !== location.origin) { return; }
    document.body.innerHTML = event.data;
})