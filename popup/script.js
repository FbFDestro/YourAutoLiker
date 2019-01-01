class Page {
    constructor() {
        this.buttons = document.getElementById('buttons');
        this.alwaysLikeBtn = document.getElementById('alwaysLike');
        this.alwaysDislikeBtn = document.getElementById('alwaysDislike');
        this.name = document.getElementById('name');
        this.image = document.getElementById('logo');
        this.subscribeBtn = document.getElementById('subscribe');
        this.reactingInfo = document.getElementById('reactingInfo');
        this.divideLine = document.getElementById('divideLine');
        this.loadingIcon = document.querySelector('.icon.loading');
        this.supportBtn = document.getElementById('support');

        this.configurationBtn = document.getElementById('configureExtensionBtn');
        this.configurationBtn.onclick = function (){
            chrome.runtime.openOptionsPage();
        }
    }

    showElement(element) {
        element.setAttribute('show', "true");
    }

    hideElement(element) {
        element.setAttribute('show', "false");
    }

    trimString(str) {
        if (str.length > 34) {
            return str.substring(0, 34) + '..';
        }
        return str;
    }

    setSubscribeBtnNotSubscribed() {
        this.subscribeBtn.setAttribute('subscribed', "false");
        this.subscribeBtn.getElementsByTagName('a')[0].innerText = 'Inscrever-se';
    }
    setSubscribeBtnSubscribed() {
        this.subscribeBtn.setAttribute('subscribed', "true");
        this.subscribeBtn.getElementsByTagName('a')[0].innerText = 'Inscrito';
    }

    updateData(data) {

        this.name.innerText = this.trimString(data.name);
        this.image.src = data.image;

        this.showElement(this.subscribeBtn);
        if (!data.isSubscribed) {
            this.setSubscribeBtnNotSubscribed();
        }else {
            this.setSubscribeBtnSubscribed();
        }
        if (data.pageType == '/watch') {
            getWhenReact(this);
        }
    }

    showLikeDislikeButtons(statusLikeDislike) {
        console.log(statusLikeDislike.alwaysLike);
        if (statusLikeDislike.alwaysLike) {
            this.showStopAlwaysLike();
        } else if (statusLikeDislike.alwaysDislike) {
            this.showStopAlwaysDislike();
        } else {
            this.showStartAlwaysBoth();
        }
    }

    setTextAndState(button, text, state) {
        button.getElementsByTagName('a')[0].innerText = text;
        button.setAttribute('alreadySubscribed', state);
        this.showElement(button);
    }

    showStartAlwaysBoth() {
        this.setTextAndState(this.alwaysLikeBtn, 'Sempre gostar desse canal', "false");
        this.showElement(this.alwaysLikeBtn);

        this.setTextAndState(this.alwaysDislikeBtn, 'Sempre não gostar desse canal', "false");
        this.showElement(this.alwaysDislikeBtn);
    }

    showStopAlwaysLike() {
        this.setTextAndState(this.alwaysLikeBtn, 'Parar de sempre gostar desse canal', "true");
        this.hideElement(this.alwaysDislikeBtn);
    }

    showStopAlwaysDislike() {
        this.setTextAndState(this.alwaysDislikeBtn, 'Parar de sempre não gostar desse canal', "true");
        this.hideElement(this.alwaysLikeBtn);
    }

    addButtonsOnClickEvent() {
        addButtonsOnClickEvent(this);
    }
}

function getWhenReact(thePage){
    chrome.storage.sync.get(['whenReactInPercent'], function (result) {
        thePage.reactingInfo.innerText = "Reagindo em " + result.whenReactInPercent * 100 + "% do video";
        thePage.showElement(thePage.reactingInfo);
    });
}

function addButtonsOnClickEvent(thePage) {
    thePage.alwaysLikeBtn.onclick = function () {
        if (thePage.alwaysLikeBtn.getAttribute('alreadySubscribed') == "false") { // start always like
            sendMessage('startAlwaysLike');
            thePage.showStopAlwaysLike();
        } else { // stop always like
            sendMessage('stopAlwaysLike');
            thePage.showStartAlwaysBoth();
        }
    }
    thePage.alwaysDislikeBtn.onclick = function () {
        if (thePage.alwaysDislikeBtn.getAttribute('alreadySubscribed') == "false") { // start always dislike
            sendMessage('startAlwaysDislike');
            thePage.showStopAlwaysDislike();
        } else { // stop always dislike
            sendMessage('stopAlwaysDislike');
            thePage.showStartAlwaysBoth();
        }
    }
    thePage.subscribeBtn.onclick = function () {
        sendMessage('clickSubscribeBtn');
        if (thePage.subscribeBtn.getAttribute('subscribed') == 'false') {
            thePage.setSubscribeBtnSubscribed();
        } // else is not needed because to confirm subscription is needed to confirm and popup will close anyway
    }
}

function sendMessage(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, getTabInfo);
    function getTabInfo(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    }
}

let page = new Page(); // create a page
sendMessage('loadingPopup'); // send message to content script

/* page.showLikeDislikeButtons({alwaysLike: false,alwaysDislike:true});
page.addButtonsOnClickEvent(); */

chrome.runtime.onMessage.addListener(reciveMessage);
function reciveMessage(message, sender, sendResponse) {
    console.log(sender);
    if (sender !== undefined && sender.tab !== undefined && sender.tab.active) {
        console.log(message);
        if (message.type == 'stopLoading') {
            page.hideElement(page.loadingIcon);
        } else if (message.type == 'hasInfo') {

            page.hideElement(page.supportBtn);
            page.hideElement(page.loadingIcon);
            page.showElement(page.divideLine);

            /*     page.updateData({
                    name: 'Fabio',
                    image: 'https://yt3.ggpht.com/a-/AAuE7mAqPxCRniHNABskSif7Fsc2ifnv5ofVYt06zg=s48-mo-c-c0xffffffff-rj-k-no',
                    isSubscribed: true,
                    pageType: '/watch'
                }); */
            page.updateData(message.data);
            page.showLikeDislikeButtons(message.statusLikeDislike);
            page.addButtonsOnClickEvent();
        }
    }
}