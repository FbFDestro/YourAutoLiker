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
        this.refreshBtn = document.getElementById('refresh');

        this.configurationBtn = document.getElementById('configureExtensionBtn');
        this.configurationBtn.onclick = function () {
            chrome.runtime.openOptionsPage();
        }

        this.refreshBtn.onclick = refreshed;

    }

    showElement(element) {
        element.setAttribute('show', "true");
    }

    hideElement(element) {
        element.setAttribute('show', "false");
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

        this.name.innerText = data.name;
        this.image.src = data.image;

        this.showElement(this.subscribeBtn);
        if (!data.isSubscribed) {
            this.setSubscribeBtnNotSubscribed();
        } else {
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


function getWhenReact(thePage) {
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
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, getTabInfo);

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

function refreshed() {
    sendMessage('popupRequestRefresh');

    let img = page.refreshBtn.getElementsByTagName('img')[0];
    img.src = '../imgs/load.gif';

    setTimeout(function () {
        img.src = '../imgs/refresh.png';
    }, 600);

}

var _AnalyticsCode = 'UA-134153603-1';
var _gaq = _gaq || [];
_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);

(function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

function trackButtonClick(e) {
    _gaq.push(['_trackEvent', e.target.className, 'clicked']);
    console.log("id " + e.target.className);
}

document.addEventListener('DOMContentLoaded', function () {
    itens = ['support', 'subscribe', 'refresh', 'alwaysLike', 'alwaysDislike', 'configureExtensionBtn'];
    for (item of itens) {
        let button = document.getElementById(item);
        if (button !== null && button !== undefined) {
            button.addEventListener('click', trackButtonClick);
            console.log(button);
        }
    }
});