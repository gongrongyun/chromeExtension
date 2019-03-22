var bg = chrome.extension.getBackgroundPage();

document.getElementById("getStart").onclick = function() {
    bg.start();
    document.querySelector("input").checked = true;
}

document.getElementById("getEnd").onclick = function() {
    bg.end();
    document.querySelector("input").checked = false;
}