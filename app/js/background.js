var isWorking = false;


function httpRequest(url, data) {
    const promise = new Promise(function(resolve, reject) {
        const handler = function() {
            if(this.readyState != 4) {
                return;
            }
            if(this.status === 200) {
                resolve(this.response);
            } else {
                reject(new Error(this.statusText));
            }
        }
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.onreadystatechange = handler;
        xhr.send(JSON.stringify(data));

    });

    return promise;
}

function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({active: true, currentWindow:true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
            if(callback) callback(response);
        });
    });
}

function start() {
    if(isWorking == false) {
        isWorking = true;
        sendMessageToContentScript(isWorking, function(response) {
            chrome.notifications.create(null, {
                type: 'basic',
                iconUrl: 'app/images/logo_v2_qkteam.png',
                title: '温馨提示',
                message: '您现在已经开启了爬虫模式!'
            });
        });
    }
}

function end() {
    if(isWorking == true) {
        isWorking = false;
        sendMessageToContentScript(isWorking, function(response) {
            chrome.notifications.create(null, {
                type: 'basic',
                iconUrl: 'app/images/logo_v2_qkteam.png',
                title: '温馨提示',
                message: '您现在已经关闭了爬虫模式!'
            });
        });
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //将数据发往后端
    // httpRequest(url, request);
    chrome.notifications.create(null, {
        type: 'basic',
        iconUrl: 'app/images/logo_v2_qkteam.png',
        title: '温馨提示',
        message: '已经开始为您爬取数据'
    });
})