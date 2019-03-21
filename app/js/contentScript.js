chrome.runtime.onMessage.addListener(function(request, sender, sendSponse) {
    if(request == true) {
        addListener();
    }
    else {

    }
});

function addListener() {
    var orginColor,
        currentNode;
    document.addEventListener("onmouseover", function(e) {
        currentNode = e.target;
        orginColor = currentNode.style.backgroundColor;
        currentNode.style.backgroundColor = "lightblue";
    });
    document.addEventListener("onmouseout", function(e) {
        currentNode.style.backgroundColor = orginColor;
    })
}