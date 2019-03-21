var isWorking = false;

function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
        chrome.tabs.sendMessage(tabs.length ? tabs[0].id : null, message, function(response) {
            if(callback) callback(response);
        });
    });
}

function start() {
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

function end() {
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