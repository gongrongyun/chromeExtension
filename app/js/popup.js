var bg = chrome.extension.getBackgroundPage();

document.getElementById("getStart").onclick = function() {
    bg.start();
}

document.getElementById("getEnd").onclick = function() {
    bg.end();
}