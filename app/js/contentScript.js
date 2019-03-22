class operation {
    constructor(){
        this.orginColor = "";
        this.currentNode = null;
        this.injectWindow = null;
        this._id = null;
        this._className = null;
        this.message = {
            "className": null,
            "idName": null 
        }
    }

    handler(e) {
        switch(e.type) {
            case "mouseover":
                this.currentNode = e.target;
                this.orginColor = this.currentNode.style.backgroundColor;
                this.currentNode.style.backgroundColor = "lightblue";
                break;
            case "mouseout":
                this.currentNode.style.backgroundColor = this.orginColor;
                break;
            case "click":
                this._className = e.target.classList || null;
                this._id = e.target.id || null;
                break;
        }
    }

    judgeIfOnInjectWindow(x, y) {
        const rect = this.injectWindow.getBoundingClientRect();
        if((x < rect.left || x > rect.right) && (y < rect.top || y > rect.bottom)) {
            return false;
        }
        return true;
    }
    

    addListener() {
        document.addEventListener("mouseover", this.handler);
        document.addEventListener("mouseout", this.handler);
        document.addEventListener("click", this.handler);
    }

    removeListener() {
        document.removeEventListener("mouseover", this.handler);
        document.removeEventListener("mouseout", this.handler);
    }

    injectWindowInit() {
        this.injectWindow = document.createElement("div");
        this.injectWindow.id = "injectWindow";
        this.injectWindow.classList.add("injectWindow");
        this.injectWindow.innerHTML = "\
            <div class='dragBar'></div>\
            <div class='mainContainer'></div>\
        ";
        document.body.insertBefore(this.injectWindow, document.body.firstChild);
    }

    injectWindowMove() {
        let isdragging = false;
        this.injectWindow.children[0].onmousedown = (e) => {
            isdragging = true;
            let preX, preY;
            const rect = this.injectWindow.getBoundingClientRect();
            if(e.clientX <= document.body.clientWidth && e.clientY <= document.body.clientHeight) {
                preX = e.clientX - rect.left;
                preY = e.clientY - rect.top;
            }
            document.onmousemove = (e) => {
                if(isdragging) {
                    let disX = e.clientX - preX;
                    let disY = e.clientY - preY;
                    if(disX <= document.body.clientWidth - rect.width && disY <= document.body.clientHeight - rect.height) {
                        this.injectWindow.style.left = disX + "px";
                        this.injectWindow.style.top = disY + "px";
                    }
                }
            };
        };
        this.injectWindow.onmouseup = () => {
            isdragging = false;
        }
    }

    resizeOfInjectWindow() {

    }
}

const operator = new operation();


chrome.runtime.onMessage.addListener(function(request, sender, sendSponse) {
    if(request == true) {
        operator.addListener();
        operator.injectWindowInit();
        operator.injectWindowMove();
    }
    else {
        operator.removeListener();
    }
});