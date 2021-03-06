// ==UserScript==
// @name         Pretty File Viewer
// @namespace    https://japnaa.github.io/Userscripts/
// @version      1.1.3
// @description  (Chrome) Changes the ugly file viewer layout to a much prettier one
// @author       JaPNaA
// @match        file:///*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
// query selector
!function () { function e(e, l) { if ("object" == typeof e) return e; var t; if ("<" == e.substring(0, 1)) { var n = document.createElement("div"); n.innerHTML = e, t = n.children } else t = this == window ? document.querySelectorAll(e) : this.querySelectorAll(e); if (l) { if (1 == l || "first" == l || "element" == l) t = t[0]; else if ("last" == l) t = t[t.length - 1]; else if ("all" == l || 2 == l || "array" == l) "#" == e.substring(0, 1); else if (1 == t.length) t = t[0]; else if (0 == t.length) t = null; else if (!(t.length < 1)) return t } else if (1 == t.length) t = t[0]; else if (0 == t.length) t = null; else if (!(t.length < 1)) return t; return t && t.length && (t = [].slice.call(t)), t } Element.prototype.$ = e, Window.prototype.isWindow = !0, window.$ = e }();

if ($('meta') && $("meta")[1] && $("meta")[1].getAttribute('name') == "google") { //Checks if it's a file index before executing
    (function () {
        // get files
        var files = (function () {
            var a = [].slice.call($('tbody').children), r = [];
            a.forEach(function (ob) {
                var b = [];
                b.push(ob.children[0].getAttribute('data-value'));
                b.push(function () {
                    if (b[0].substring(b[0].length - 1, b[0].length) == "/") {
                        b[0] = b[0].substring(0, b[0].length - 1);
                        return 1;
                    } else if (b[0] == "..") {
                        return 2;
                    } else {
                        return 0;
                    }
                }());
                b.push(ob.children[1].getAttribute('data-value') - 1 + 1);
                b.push(ob.children[2].getAttribute('data-value') - 1 + 1);
                r.push(b);
            });
            return r;
        }()), title = $("#header").innerHTML.substring(9, $("#header").innerHTML.length), pf = "PFV_display_", display = {
            sort: GM_getValue(pf + 'sort') || 0,
            icoSize: GM_getValue(pf + "icoSize") || 64,
            theme: GM_getValue(pf + "theme") || false,
            themeCol: GM_getValue(pf + "tCol") || "#FFFFFF"
        };
        document.body.innerHTML = ""; //Clear doc
        document.head.innerHTML = "";
        document.body.appendChild($("<div id=everything> <div id=title>" + (function () { //Generate layout
            var ftitle = title.split(/[\/\\]/g), final = "", cnt = 0;
            window.ftitle = ftitle;
            ftitle.forEach(function (ob) {
                if (ob) {
                    final += "<span class=tree name='" + cnt + "'>" + ob + "/</span>";
                    cnt++;
                }
            });
            return final + "<div id=copyURL title='Copy URL'></div><div id=settings title='Settings'></div>";
        }()) + "</div><div id=files>" + (function () {
            var f = "";
            files.forEach(function (ob) {
                if (ob[1] == 2) {
                    return "";
                }
                f += "<div class=" + (function () {
                    if (ob[1]) {
                        return "folder";
                    } else {
                        return "file";
                    }
                }()) + " name='" + ob[0] + "' title='" + ("Name: " + ob[0] + "\n" + "Modified: " + new Date(ob[3] * 1e3).toDateString() + ", " + new Date(ob[3] * 1e3).toLocaleTimeString() + (function () {
                    if (ob[1]) {
                        return "";
                    } else {
                        return "\nSize: " + ob[2] + " bytes";
                    }
                }())) + "'> <div class=name>" + ob[0] + "</div> </div>";
            });
            return f;
        }()) + "</div><div id=footCredits> <b>Pretty File Viewer</b> by someRandomGuy</div></div>"));
        (function () {
            $('#footCredits').addEventListener('click', function () {
                snackbar("<a href='https://github.com/JaPNaA/Pretty-File-Viewer' target='_blank'> GitHub </a> <a href='https://greasyfork.org/en/scripts/29887-pretty-file-viewer' target='_blank'> GreasyFork </a>", 1e4);
            }, false);
        }());
        (function () { //Click file/folder
            var a = [].slice.call($('#files').children);
            a.forEach(function (ob) {
                ob.addEventListener("click", function () {
                    var b = this.getAttribute('name');
                    b = encodeURIComponent(b);
                    location.assign(b);
                }, false);
            });
        }());
        (function () { //Applies "last" class to tree
            var a = $(".tree"), b;
            if (a) {
                b = a[a.length - 1];
            } else {
                return;
            }
            if (b) { b.classList.add("last"); }
            else { a.classList.add("last"); }
        }());
        (function () { //Makes tree clickable
            var el = $('.tree');
            if (!el) return;
            var a = [].slice.call(el);

            a.forEach(function (ob) {
                ob.addEventListener('click', function () {
                    var b = this.getAttribute('name') * 1, c = ftitle.length - (b + 2), d = "";
                    for (var g = 0; g < c; g++) {
                        d += "../";
                    }
                    location.assign(d);
                }, false);
            });
        }());
        var settingsOpen = false;
        $('#settings').addEventListener('click', function () {//Open settings on click
            settingsOpen = true;
            var sP = $('<div class=settingsPannel></div>'), sL = $('<div class=settingsOV></div>');
            sP.innerHTML = "<div id=heading>Settings [WIP]</div><div>Theme colour: <input type=color id=tCol></div><div><input type=checkbox id=tdark>Dark Mode</div>"; //Contents of settings pannel
            document.body.appendChild(sP);
            document.body.appendChild(sL);
            $('#tCol').value = display.themeCol;
            $('#tdark').checked = display.theme;
            $('#tCol').addEventListener('change', function () {
                GM_setValue(pf + "tCol", this.value);
                display.themeCol = this.value;
                updCol();
            }, false);
            $('#tdark').addEventListener('change', function () {
                GM_setValue(pf + "theme", this.checked);
                display.theme = this.checked;
                updCol();
            }, false);
            $('.settingsOV').addEventListener('click', function (e) {
                closeSettings(); //On overlay click, close settings
            }, false);
            $('#everything').style.filter = "blur(2px)";
            setTimeout(function () {
                sP.style.top = "10%"; //Show settings pannel
            }, 1);
        }, false);
        function updCol() {
            var a = display.themeCol.substring(1, 7), b = { bgCol: "", tCol: "", fBG: "", sBG: "" }, c;
            a = ("0x" + a) - 1 + 1;
            c = a.toString(16);
            c = ["0x" + c.substr(0, 2) - 1 + 1, ("0x" + c.substr(2, 2) - 1 + 1) || 0, ("0x" + c.substr(4, 2) - 1 + 1) || 0];
            console.log(c);
            b.bgCol = (function () {
                var f = "#", a;
                c.forEach(function (o) {
                    a = Math.floor(((o / 2 % 128) + 136) * 1.25).toString(16);
                    if (a.length == 1) {
                        a += "0";
                    }
                    if (a.length > 2) {
                        a = "FF";
                    }
                    f += a;
                });
                return f;
            }());
            b.tCol = (function () {
                var f = "#", a;
                c.forEach(function (o) {
                    a = Math.floor(((o / 2 % 128) + 136) * 1.5).toString(16);
                    if (a.length == 1) {
                        a += "0";
                    }
                    if (a.length > 2) {
                        a = "FF";
                    }
                    f += a;
                });
                return f;
            }());
            console.log(b);
            document.body.style.backgroundColor = b.bgCol;
            $("#title").backgroundColor = b.tCol;
        }
        updCol();
        function closeSettings() { //Close settings
            var sP = $('.settingsPannel'), sL = $('.settingsOV');
            sP.style.top = "-70%";
            $("#everything").style.filter = "blur(0px)";
            setTimeout(function () {
                sL.parentElement.removeChild(sL);
                sP.parentElement.removeChild(sP);
            }, 600);
        }
        $('#copyURL').addEventListener('click', function () {
            //Copies URL
            var z = new window.Range();
            z.selectNode($('#title'));
            var e = z.toString(), a = $("<textarea>" + (e.replace(/\\/g, "/")) + "</textarea>"); // Replace [\] with [/]
            document.body.appendChild(a);
            a.focus();
            a.select();
            document.execCommand('copy');
            document.body.removeChild(a);
            snackbar('Copied!');
        }, true);
        function snackbar(e, et) { //It's not a snackbar, but I'll call it that anyway
            var a = $("<div class=snackbar>" + e + "</div>");
            document.body.appendChild(a);
            setTimeout(function () {
                a.style = "left:8px; opacity:1;";
            });
            setTimeout(function () {
                var b = $(".snackbar")[0] || $(".snackbar");
                b.style = "";
                setTimeout(function () {
                    var b = $(".snackbar")[0] || $(".snackbar");
                    document.body.removeChild(b);
                }, 350);
            }, et || 2e3);
        }
        //CSS and Title
        document.head.innerHTML = `
<title>Files</title>
<style id=defalut>
a{
color:white;
text-decoration: none;
background-color:rgba(128,128,128,0.05);
border-radius: 2px;
margin-left: 2px;
margin-right:2px;
transition: 0.15s;
}
a:visited{
color:rgb(200, 200, 200);
}
a:hover{
background-color:rgba(128,128,128,0.1);
}
input[type=color]{
width: 24px;
height: 24px;
background-color: transparent;
border-width: 0;
border-color: transparent;
padding: 0;
cursor:pointer;
}
#heading{
font-size:24px;
}
.settingsOV{
height:100%;
width:100%;
position:fixed;
top:0;
left:0;
z-index:13;
transition:0;
}
.settingsOV:hover #everything{
filter: blur(1px) !important;
}
.settingsOV:hover .settingsPannel{
top:5%;
}
.settingsPannel{
height:65%;
width:60%;
position:fixed;
top:-70%;
left:20%;
background-color:rgba(192, 192, 192, 0.975);
padding:16px;
border-radius:4px;
transition: 0.6s;
z-index:14;
}
#title{
font-size:24px;
position:fixed;
top:0px;
left:0px;
width:100%;
height:24px;
background-color:white;
padding:8px;
margin-bottom:0;
border-bottom: 1px solid;
z-index:9;
overflow:auto;
word-break: break-word;
}
#footCredits{
bottom:0px;
right:0px;
position:fixed;
opacity:.25;
font-size:12px;
cursor:pointer;
user-select:none;
}
body{
padding-top:42px;
padding-bottom:18px;
font-family:calabri;
}
.file{
background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAgAElEQVR4Xu3dCbBtWV0e8JYZGQ0CDSSCRIM0Q4AIGgkYQYYwTy0BChkiCoYhgpJgShE0xipbkCGAYEQixSyTBAqDGKISCSDSMoRCAUulkSGCgMic/9JufDbv9f3Oued/1jn7/E7Vqn7v3W+vtfdv7X73e/eec+7XnOZBgAABAgQIHJzA1xzcFbtgAgQIECBA4DQFwE1AgAABAgQOUEABOMBNd8kECBAgQEABcA8QIECAAIEDFFAADnDTXTIBAgQIEFAA3AMECBAgQOAABRSAA9x0l0yAAAECBBQA9wABAgQIEDhAAQXgADfdJRMgQIAAAQVg/++By9UlXKXGZWpc+tz/fu3+X5YrILAVgS/WKufU+P0an9rKihYhsCMCCsCObERwGmOvzqjxXTWuX+Na544rB8eKECBwwQJfqA//eo0n1PgNWAQOQUAB2O1dvmyd3t1q3KbGLWpcabdP19kRWITAy+oqvr/GRxdxNS6CwCkEFIDduzUuUqf03TW+t8Zda1xi907RGRFYvMD76gpvVWP814PAIgUUgN3Z1vGJ/gE1Hl3jGrtzWs6EwMEKfKCu/NtqfPhgBVz4ogUUgPnbO56w95AaP1zj9Pmn4wwIEDhB4Oz69S1r+HaA22JxAgrA3C29Yy3/ZP/in7sJVidwhIAS4BZZpIACMGdbr37uJ/47zVneqgQIrCigBKwIJr77AgrA9vfonrXks2qM1+17ECCwPwJKwP7slTMNBBSAAGlDkfEkvyfWePCG5jMNAQLbF1ACtm9uxSYBBaAJ9nzTXq1+/6oaN9jOclYhQKBRQAloxDX19gQUgH7rb6klXlvjG/qXsgIBAlsSUAK2BG2ZPgEFoM92zHyTGq+ucYXeZcxOgMAEASVgArolNyegAGzO8vwzjU/+r69xqb4lzEyAwGQBJWDyBlh+fQEFYH27Czpy/KCe3/Ev/x5csxLYMQElYMc2xOlkAgpA5rRKajzh7401fM9/FTVZAvstoATs9/4d5NkrAJvd9vFSv/9dw7P9N+tqNgL7IKAE7MMuOcevCCgAm70Znl7TeZ3/Zk3NRmCfBJSAfdqtAz9XBWBzN8B4h78XbG46MxEgsKcCSsCebtyhnbYCsJkdH+/t/wc1vL3vZjzNQmDfBZSAfd/BAzh/BWAzm/zymubOm5nKLAQILERACVjIRi71MhSA4+/s+JG+rzz+NGYgQGCBAkrAAjd1KZekABxvJ7+2Dn9njWscb5q1jx7fdhhvNvSWGu+p8Sc1Plnjr2p8ee1ZHUhgvwVeUqd/9x26BCVghzbDqfydgAJwvLvhUXX4WcebYuWjP1hHjB8n/Cs1/mjlox1AYPkCu1YAhrgSsPz7bu+uUAFYf8vGa/7fX+P09adY6cg/r/Rja/xyjc+udKQwgcMS2MUCoAQc1j24F1erAKy/TQ+pQ5+2/uErHTneX+BHa3x8paOECRymwK4WACXgMO/Hnb1qBWC9rblIHfbeGtdY7/D4qE9U8v41xqsMPAgQyAR2uQAoAdkeSm1BQAFYD/m2ddhr1js0Pmp8r/82Nd4RHyFIgMAQ2PUCoAS4T3dCQAFYbxueV4fda71Do6PGJ/9/UWM8x8CDAIHVBPahACgBq+2pdIOAArA66mXrkPGEvPEkwI7H+LL/+OTvX/4duuY8BIF9KQBKwCHcjTt8jQrA6ptz/zrk2asfFh9x10r6nn/MJUjgqwT2qQAoAW7gaQIKwOr0z69D/vXqh0VHjGf7/2CUFCJA4FQC+1YAlAD38hQBBWA19uH1oRpXWu2wKD2+rfAtNbzUL+ISInBKgX0sAEqAG3rrAgrAauTXqXjX9+YfXHP/wmqnI02AwEkE9rUAKAFu560KKACrcT+04k9Z7ZAoPZ71f80a3uEv4hIicIEC+1wAlAA399YEFIDVqJ9Z8QetdkiUflylfiJKChEgcJTAvhcAJeCoHfbxjQgoAKsxvqHiN1/tkCj9TZXyg30iKiECRwp0FIDP1KqXPHLlzQb8AKHNeprtfAIKwGq3xHgC4JVXO+TI9PiRvtc/MiVAgEAq0FEAXlSLn1PjEelJbCinBGwI0jRfLaAA5HfF5Sra8Qz9J9W8/y4/DUkCBI4Q6CgAL6w1x7t/PlEJcP8tRUAByHdyvETv3Xk8Tt63ks+N04IECBwl0FUAxvt/jL8zlYCjdsDH90JAAci36cYV/T95PE7epJJvjtOCBAgcJdBZAMbaSsBRO+DjeyGgAOTb9F0VfX0ej5NXqeR4boEHAQKbEeguAErAZvbJLJMFFIB8A+5U0Vfk8Th56Up+Ok4LEiBwlMA2CoAScNQu+PjOCygA+RaN7/+NnwOw6ceFasIvb3pS8xE4YIFtFQAl4IBvsiVcugKQ72JXAbAH+R5IEkgEtlkAlIBkR2R2UsAnn3xbFIDcSpLATIFtFwAlYOZuW3ttAQUgp1MAcitJAjMFZhQAJWDmjlt7LQEFIGdTAHIrSQIzBWYVACVg5q5be2UBBSAnUwByK0kCMwVmFgAlYObOW3slAQUg51IAcitJAjMFZhcAJWDm7ls7FlAAYqrTFIDcSpLATIFdKABKwMw7wNqRgAIQMf1NSAHIrSQJzBTYlQKgBMy8C6x9pIACcCTRVwIKQG4lSWCmwC4VACVg5p1g7QsUUADyG0QByK0kCcwU2LUCoATMvBusfUoBBSC/ORSA3EqSwEyBXSwASsDMO8LaJxVQAPIbQwHIrSQJzBTY1QKgBMy8K6z9VQIKQH5TKAC5lSSBmQK7XACUgJl3hrX/noACkN8QCkBuJUlgpsCuFwAlYObdYe2vCCgA+c2gAORWkgRmCuxDAVACZt4h1v4bAQUgvxEUgNxKksBMgX0pAErAzLvE2grACveAArACliiBiQL7VACUgIk3yqEv7SsA+R2gAORWkgRmCuxbAVACZt4tB7y2ApBvvgKQW0kSmCmwjwVACZh5xxzo2gpAvvEKQG4lSWCmwL4WACVg5l1zgGsrAPmmKwC5lSSBmQL7XACUgJl3zoGtrQDkG64A5FaSBGYK7HsBUAJm3j0HtLYCkG+2ApBbSRKYKbCEAqAEzLyDDmRtBSDfaAUgt5IkMFNgKQVACZh5Fx3A2gpAvskKQG4lSWCmwJIKgBIw805a+NoKQL7BCkBuJUlgpsDSCoASMPNuWvDaCkC+uQpAbiVJYKbAEguAEjDzjlro2gpAvrEKQG4lSWCmwFILgBIw865a4NoKQL6pCkBuJUlgpsCSC4ASMPPOWtjaCkC+oQpAbiVJYKbA0guAEjDz7lrQ2gpAvpkKQG4lSWCmwCEUACVg5h22kLUVgHwjFYDcSpLATIFDKQBKwMy7bAFrKwD5JioAuZUkgZkCh1QAlICZd9qer60A5BuoAORWkgRmChxaAVACZt5te7y2ApBvngKQW0kSmClwiAVACZh5x+3p2gpAvnEKQG4lSWCmwKEWACVg5l23h2srAPmmKQC5lSSBmQKHXACUgJl33p6trQDkG6YA5FaSBGYKHHoBUAJm3n17tLYCkG+WApBbSRKYKaAA/K3++Pv9iTUeseXNOLvWu2WNj255XcutKKAA5GAKQG4lSWCmgALwd/pKwMw7ccfXVgDyDVIAcitJAjMFFIC/r68EzLwbd3htBSDfHAUgt5IkMFNAAfhqfSVg5h25o2srAPnGKAC5lSSBmQIKwMn1lYCZd+UOrq0A5JuiAORWkgRmCigAp9ZXAmbemTu2tgKQb4gCkFtJEpgpoABcsL4SMPPu3KG1FYB8MxSA3EqSwEwBBeBofSXgaKPFJxSAfIsVgNxKksBMAQUg01cCMqfFphSAfGsVgNxKksBMAQUg11cCcqvFJRWAfEsVgNxKksBMAQVgNX0lYDWvxaQVgHwrFYDcSpLATAEFYHV9JWB1s70/QgHIt1AByK0kCcwUUADW01cC1nPb26MUgHzrFIDcSpLATAEFYH19JWB9u707UgHIt0wByK0kCcwUUACOp68EHM9vb45WAPKtUgByK0kCMwUUgOPrKwHHN9z5GRSAfIsUgNxKksBMAQVgM/pKwGYcd3YWBSDfGgUgt5IkMFNAAdicvhKwOcudm0kByLdEAcitJAnMFFAANquvBGzWc2dmUwDyrVAAcitJAjMFFIDN6ysBmzedPqMCkG+BApBbSRKYKaAA9OgrAT2u02ZVAHJ6BSC3kiQwU0AB6NNXAvpstz6zApCTKwC5lSSBmQIKQK++EtDru7XZFYCcWgHIrSQJzBRQAPr1lYB+4/YVFICcWAHIrSQJzBRQALajrwRsx7ltFQUgp1UAcitJAjMFOgrAn9UF/e7Mi9rRtcfnkNvVuMSWz+/sWu+WNT665XUXtZwCkG+nApBbSRKYKdBRAGZej7VPLqAEHPPOUAByQAUgt5IkMFNAAZipv921Rwm4VY0Pb3fZZaymAOT7qADkVpIEZgooADP1t7/2B2rJ767xR9tfer9XVADy/VMAcitJAjMFFICZ+nPWfn8te+MaH5uz/H6uqgDk+6YA5FaSBGYKKAAz9eet/dJa+u7zlt+/lRWAfM8UgNxKksBMAQVgpv7ctW9Ry//m3FPYn9UVgHyvFIDcSpLATAEFYKb+3LVfWcvfee4p7M/qCkC+VwpAbiVJYKaAAjBTf+7an6vlL1/jM3NPYz9WVwDyfVIAcitJAjMFFICZ+vPXvkmdwpvnn8bun4ECkO+RApBbSRKYKaAAzNSfv/Zd6xRePv80dv8MFIB8jxSA3EqSwEyBF9Ti95x5AtaeKnBmrT5KoMcRAgpAfosoALmVJIGZAk+qxR8+8wSsPVVAAQj5FYAQqmIKQG4lSWCmwP1r8WfPPAFrTxVQAEJ+BSCEUgByKEkCkwVOr/XHT++70OTzsPwcAQUgdFcAQigFIIeSJLADAp4IuAObMOkUFIAQXgEIoRSAHEqSwA4IXLvO4e01LroD5+IUtiugAITeCkAIpQDkUJIEdkTgUXUeZ+3IuTiN7QkoAKG1AhBCKQA5lCSBHREYf7+NVwQ8bEfOx2lsR0ABCJ0VgBBKAcihJAnskMD4O+6HavxMDd8O2KGNaTwVBSDEVQBCKAUgh5IksIMC16pzelyNe9S48A6en1PanIACEFoqACGUApBDSRLYYYEr1rndqsYNa4yXC/qqwNzN6njHRgUg3FMFIIRSAHIoSQIECIQCXw5zq8QUgFBLAQihFIAcSpIAAQKhgAIQQnXEFIBc1VsB51aSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQUgESpKaMA5LAKQG4lSYAAgURAAUiUmjIKQA6rAORWkgQIEEgEFIBEqSmjAOSwCkBuJUmAAIFEQAFIlJoyCkAOqwDkVpIECBBIBBSARKkpowDksApAbiVJgACBREABSJSaMgpADqsA5FaSBAgQSAQU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);
background-
}
.folder{
background-image:url(data:image/png;base64,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vWp9MOhv++sNeEcCwOqBdK8VuLZ4vKyKH6T/P68MHO+TrN0QIECAAIFREjibBrNQlcXPp6baZ4f1Tf9OADseANYbWHeFoLg+12mV+4tO6XTBKE1fYyFAgACBrQm0qoVWp7p4vZg4vxPf8Dcb5EgGgM0G7c8JECBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegICQD0/WxMgQIAAgUYKCACNbJtBEyBAgACBegL/AisOepaMosBVAAAAAElFTkSuQmCC);
}
.name{
position:relative;
height:38px;
width:100%;
top:54px;
text-align:center;
background-color:rgba(255,255,255,0.75);
transition:0.45s;
font-family:monospace;
word-wrap: break-word;
}
.folder:hover .name, .file:hover .name{
height:92px;
top:0px;
background-color:rgba(255,255,255,0.9);
}
.file,.folder{
width:84px;
height:92px;
background-color:rgba(111,111,111,0.1);
display:inline-block;
margin:2px;
margin-top:0;
margin-bottom:0;
overflow:hidden;
border-radius:2px;
cursor: pointer;
background-size: contain;
background-repeat: no-repeat;
user-select:none;
}
#copyURL{
background-image:url("https://maxcdn.icons8.com/Share/icon/Editing//copy-21600.png");
background-size:contain;
background-repeat:no-repeat;
width:13px;
height:13px;
display:inline-block;
margin-left:12px;
position:absolute;
top:12px;
right:52px;
z-index:11;
cursor:pointer;
transition:.15s;
border:2px solid transparent;
border-radius:2px;
}
#copyURL:hover{
background-color:#ddd;
border:2px solid #ddd;
}
.tree:hover{
background-color:#efefef;
}
.tree{
transition:0.15s;
cursor:pointer;
border-radius:2px;
}
.tree.last{
border:1px solid #efefef;
background-image:url(https://cdn1.iconfinder.com/data/icons/material-core/16/refresh-128.png);
background-position:center;
background-repeat:no-repeat;
background-size:0px;
}
.tree.last:hover{
background-size:24px;
}
.snackbar{
border-radius:4px;
background-color:#131313;
left:-64px;
position:fixed;
bottom: 8px;
transition:0.35s ease;
opacity:0;
color:white;
font-size:18px;
padding:12px;
padding-left:24px;
padding-right:24px;
font-family:sans-seirf;
}
#settings{
background-image:url(https://cdn1.iconfinder.com/data/icons/material-core/20/settings-128.png);
background-size:contain;
background-repeat:no-repeat;
width:13px;
height:13px;
display:inline-block;
margin-left:12px;
position:absolute;
top:12px;
right:24px;
z-index:11;
cursor:pointer;
transition:.15s;
border:2px solid transparent;
border-radius:2px;
}
#settings:hover{
background-color:#ddd;
border:2px solid #ddd;
}
</style>

<style id=theme>
</style>

<style id=uTheme>
</style>
`;
        document.title = "Files - " + title;
        //	debugger; //For debugging.
    })();
}
