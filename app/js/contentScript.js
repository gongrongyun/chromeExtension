class operation {

    constructor(){
        this.orginColor = "";
        this.currentNode = null;
        this.injectWindow = null;
        this._id = null;
        this._classList = null;
        this._url = window.location.href;
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
                    this._classList = e.target.classList || null;
                    this._id = e.target.getAttribute("id") || null;
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
            <div class='displayList'>\
            </div>\
        ";
        let textStack = [];
        let tempText = "";
        this.injectWindow.querySelector(".mainContainer").innerHTML = node;
        textStack = this.currentNode.innerText.split("\n");
        
        let ul = document.createElement("ul");
        textStack = textStack.map((elememt) => (`<li>字段· ${elememt}</li><br>`)).join("\n");
        this.currentNode.querySelectorAll("a").forEach((elememt) => {
            if(elememt.href) {
                tempText +=`<li>链接· ${elememt.href}</li><br>`;
            }
        });
        ul.innerHTML = textStack + tempText;
        this.injectWindow.querySelector(".displayList").appendChild(ul);

        let liArray = this.injectWindow.querySelectorAll("li");
        liArray[0].onclick = () => {
            chrome.runtime.sendMessage({"url": this._url, "classList": this._classList, "idName": this._id}, function(response) {
                // do something
            });
        }
        liArray[1].onclick = () => {
            this.injectWindow.querySelector(".mainContainer").innerHTML = "\
                <p>请选择页面元素</p>\
            ";
        }
    }

    findAllChild(node, stack) {
        if(node != undefined) {
            if(node.innerText) {
                stack.push(node.innerText);
            }
            for(let i = 0; i < node.childNodes.length; i++) {
                this.findAllChild(node.children[i], stack);
            }
        }
    }

    preventReload(order) {
        if(order == "open") {
            window.onbeforeunload = () => {
                return false;
            }
        }
        else {
            window.onbeforeunload = () => {
                return true;
            }
        }
    }
}

const operator = new operation();


chrome.runtime.onMessage.addListener(function(request, sender, sendSponse) {
    if(request == true) {
        operator.injectWindowInit();
        operator.injectWindowMove();
        operator.addListener();
        operator.preventReload("open");
    }
    else {
        operator.removeListener();
        location.reload();
        operator.preventReload("close");
    }
});