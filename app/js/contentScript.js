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
        },
        this.handler = this.handler.bind(this);
    }

    handler(e) {
        switch(e.type) {
            case "mouseover":
                this.currentNode = e.target;
                this.orginColor = this.currentNode.style.backgroundColor;
                if(!this.judgeIfOnInjectWindow(e.clientX, e.clientY)) {
                    this.currentNode.style.backgroundColor = "lightblue";
                }
                break;
            case "mouseout":
                this.currentNode.style.backgroundColor = this.orginColor;
                break;
            case "click":
                if(!this.judgeIfOnInjectWindow(e.clientX, e.clientY)) {
                    this._className = e.target.classList || null;
                    this._id = e.target.id || null;
                    this.option();
                    e.preventDefault();
                }
                break;
        }
    }

    judgeIfOnInjectWindow(x, y) {
        const rect = this.injectWindow.getBoundingClientRect();
        if((x < rect.left || x > rect.right) || (y < rect.top || y > rect.bottom)) {
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
        document.removeEventListener("click", this.handler);
    }

    injectWindowInit() {
        this.injectWindow = document.createElement("div");
        this.injectWindow.id = "injectWindow";
        this.injectWindow.classList.add("injectWindow");
        this.injectWindow.innerHTML = "\
            <div class='dragBar'>Prompt</div>\
            <div class='mainContainer'><p>请选择页面元素</p></div>\
        ";
        document.body.insertBefore(this.injectWindow, document.body.firstChild);
    }

    injectWindowMove() {
        let isdragging = false;
        this.injectWindow.children[0].onmousedown = (e) => {
            isdragging = true;
            if(isdragging) {
                document.onmousewheel = () => {
                    return false;
                }
            }
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
            if(isdragging == false) {
                document.onmousewheel = () => {
                    return true;
                }
            }
        }
    }

    option() {
        let node = "\
            <p>您选中了该元素，您是想:</p>\
            <br>\
            <ul>\
                <li>爬取该元素</li>\
                <li>取消该操作</li>\
            </ul>\
        ";
        console.log(this.injectWindow.querySelector(".mainContainer").innerHTML);
        this.injectWindow.querySelector(".mainContainer").innerHTML = node;
        console.log(this.injectWindow.querySelector(".mainContainer").innerHTML);
    }
}

const operator = new operation();


chrome.runtime.onMessage.addListener(function(request, sender, sendSponse) {
    if(request == true) {
        operator.injectWindowInit();
        operator.injectWindowMove();
        operator.addListener();
    }
    else {
        operator.removeListener();
    }
});