class operation {

    constructor(){
        this.orginColor = "";
        this.currentNode = null;
        this.childColor = null;
        this.injectWindow = null;
        this._id = '';
        this._classList = '';
        this._tagName = '';
        this.childLocation = []; //发送后端定位目标元素
        this._url = window.location.href;
        this.handler = this.handler.bind(this);
        this.status = "browsing";
        this.nodeArray = [];
        this.result = ''; //递归寻找子元素相对于父元素的位置
        this.nextUrl = '';
        this.selected = false;
    }

    handler(e) {
        switch(e.type) {
            case "mouseover":
                if(this.status == "browsing") {
                    this.currentNode = e.target;
                    this.orginColor = this.currentNode.style.backgroundColor;
                    if(!this.judgeIfOnInjectWindow(e.clientX, e.clientY)) {
                        this.currentNode.style.backgroundColor = "lightblue";
                    }
                }
                else {
                    if(this.hasParent(e.target, this.currentNode) && e.target != this.currentNode) {
                        this.childColor = e.target.style.backgroundColor;
                        e.target.style.backgroundColor = "lightgreen";
                    }
                }
                break;
            case "mouseout":
                if(this.status == "browsing") {
                    this.currentNode.style.backgroundColor = this.orginColor;
                }
                else {
                    if(e.target != this.currentNode) {
                        e.target.style.backgroundColor = this.childColor;
                    }
                }
                break;
            case "click":
                if(!this.judgeIfOnInjectWindow(e.clientX, e.clientY)) {
                    if(this.status == "browsing") {
                        this.status = "selecting";
                        this._classList = e.target.classList || null;
                        this._id = e.target.getAttribute("id") || null;
                        this._tagName = e.target.getAttribute("tagName") || null;
                        this.option();
                    }
                    else {
                        if(this.selected) {
                            this.nextUrl = e.target.classList;
                        }
                        this.displaySelectText(e.target);
                        e.target.style.border = "1px solid #ff0000";
                        this.nodeArray.push({"nodeName":e.target, "styleBorder":e.target.getAttribute("border")});
                        this.result = "";
                        this.childLocation.push({className:this.locat(e.target, this.currentNode), index:this.index(e.target)});
                    }
                    e.preventDefault();
                }
                break;
        }
    }

    index(node) {
        const parent = node.parentNode;
        for(let index = 0; index < parent.children.length; index++) {
            if(node === parent.children[index]) {
                return index;
            }
        }
    }

    locat(child, parent) {
        for(let i = 0; i < parent.children.length; i++) {
            const tempResult = this.result;
            this.result += `${parent.children[i].className || parent.children[i].tagName}\\`;
            if(child === parent.children[i]) {
                return this.result;
            }
            else {
                if(this.locat(child, parent.children[i]) != undefined) {
                    return this.result;
                }
                this.result = tempResult;
            }
        }
    }

    hasParent(node, parent) {
        while(node.parentNode != undefined) {
            if(node.parentNode === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
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

    displaySelectText(node) {
        const ul = this.injectWindow.querySelector(".displaytext");
        let temptext = node.innerText.split("\n");
        temptext = temptext.map((elememt) => (`<li>字段· ${elememt}</li><br>`)).join("");
        ul.innerHTML += temptext;
    }

    option() {
        let node = "\
            <p>您选中了该元素，请选择想爬取的子元素</p>\
            <br>\
            <ul>\
                <li>选取完毕</li>\
                <li>取消该操作</li>\
            </ul>\
            <div class='displayList'>\
                <ul class='displaytext'></ul>\
            </div>\
        ";
        this.injectWindow.querySelector(".mainContainer").innerHTML = node;

        let liArray = this.injectWindow.querySelectorAll("li");
        liArray[0].onclick = () => {
            this.getNextUrlClass(liArray[0]);
        }
        liArray[1].onclick = () => {
            this.status = "browsing";
            this.selected = false;
            this.currentNode.style.backgroundColor = this.orginColor;
            for(node of this.nodeArray) {
                node.nodeName.style.border = node.styleBorder;
            }
            this.injectWindow.querySelector(".mainContainer").innerHTML = "\
                <p>请选择页面元素</p>\
            ";
            this.clearAll();
        }
    }

    clearAll() {
        this.childLocation = [];
        this.nextUrl = '';
        this._id = '';
        this._classList = '';
        this._tagName = '';
    }

    getNextUrlClass(node) {
        node.innerText = '点击下一页后点此开始爬取';
        this.selected = true;
        node.onclick = () => {
            const data = {
                url: this._url,
                classList: this._classList,
                id: this._id,
                nextUrl: this.nextUrl,
                childPosition: this.childLocation
            }
            chrome.runtime.sendMessage(data, function(response) {
                // do something
                this.selected = false;
            });
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