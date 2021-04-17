class Page {
  constructor() {
    this.buttons = document.getElementById('buttons');
    this.likeAllBtn = document.getElementById('likeAll');
    this.alwaysLikeBtn = document.getElementById('alwaysLike');
    this.alwaysDislikeBtn = document.getElementById('alwaysDislike');
    this.buttonsBlur = document.getElementById('buttonsBlur');
    this.name = document.getElementById('name');
    this.image = document.getElementById('logo');
    this.subscribeBtn = document.getElementById('subscribe');
    this.reactingInfo = document.getElementById('reactingInfo');
    this.divideLine = document.getElementById('divideLine');
    this.loadingIcon = document.querySelector('.icon.loading');
    this.supportBtn = document.getElementById('support');
    this.refreshBtn = document.getElementById('refresh');

    this.configurationBtn = document.getElementById('configureExtensionBtn');
    this.configurationBtn.getElementsByTagName('a')[0].innerText = chrome.i18n.getMessage(
      'configureExtension'
    );
    this.configurationBtn.onclick = function() {
      chrome.runtime.openOptionsPage();
    };

    this.name.onclick = function() {
      if (this.classList.contains('linkSite')) {
        chrome.tabs.create({
          url: 'https://fbfdestro.github.io/YourAutoLiker/'
        });
      }
    };

    this.image.onclick = function() {
      if (this.classList.contains('linkSite')) {
        chrome.tabs.create({
          url: 'https://fbfdestro.github.io/YourAutoLiker/'
        });
      }
    };

    this.supportBtn.getElementsByTagName('a')[0].innerText = chrome.i18n.getMessage(
      'support'
    );
    this.supportBtn.onclick = function() {
      chrome.tabs.create({
        url: 'https://fbfdestro.github.io/YourAutoLiker/#apoie'
      });
    };

    this.refreshBtn.onclick = refreshed;
  }

  showElement(element) {
    element.setAttribute('show', 'true');
  }

  startStateClass(element) {
    element.classList.add('start');
    element.classList.remove('stop');
  }

  stopStateClass(element) {
    element.classList.add('stop');
    element.classList.remove('start');
  }

  hideElement(element) {
    element.setAttribute('show', 'false');
  }

  setSubscribeBtnNotSubscribed() {
    this.subscribeBtn.setAttribute('subscribed', 'false');
    let btnLink = this.subscribeBtn.getElementsByTagName('a')[0];
    btnLink.innerText = chrome.i18n.getMessage('subscribe');
    this.startStateClass(btnLink);
  }
  setSubscribeBtnSubscribed() {
    this.subscribeBtn.setAttribute('subscribed', 'true');
    let btnLink = this.subscribeBtn.getElementsByTagName('a')[0];
    btnLink.innerText = chrome.i18n.getMessage('subscribed');
    this.stopStateClass(btnLink);
  }

  updateData(data) {
    this.name.innerText = data.name;
    this.name.classList.remove('linkSite');
    this.image.src = data.image;
    this.image.classList.remove('linkSite');

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
    if(statusLikeDislike.likeAll){
      this.showStopLikeAll();
    }else {
      this.showLikeAll();
    }

    if (statusLikeDislike.alwaysLike) {
      this.showStopAlwaysLike();
    } else if (statusLikeDislike.alwaysDislike) {
      this.showStopAlwaysDislike();
    } else {
      this.showStartAlwaysBoth();
    }
  }

  setTextAndState(button, text, state) {
    let btnLink = button.getElementsByTagName('a')[0];
    btnLink.innerText = text;
    if (state == 'false') {
      this.startStateClass(btnLink);
    } else {
      this.stopStateClass(btnLink);
    }
    button.setAttribute('alreadySubscribed', state);
    this.showElement(button);
  }

  showStartAlwaysBoth() {
    this.setTextAndState(
      this.alwaysLikeBtn,
      chrome.i18n.getMessage('alwaysLikeBtn'),
      'false'
    );
    this.showElement(this.alwaysLikeBtn);
    this.alwaysLikeBtn.getElementsByTagName('a')[0].classList.add('start');

    this.setTextAndState(
      this.alwaysDislikeBtn,
      chrome.i18n.getMessage('alwaysDislikeBtn'),
      'false'
    );
    this.showElement(this.alwaysDislikeBtn);

  }

  
  showLikeAll(){
    this.buttonsBlur.classList.remove('blur');
    this.setTextAndState(
      this.likeAllBtn,
      chrome.i18n.getMessage('likeAllBtn'),
      'false'
      ); 
  }

  showStopLikeAll(){
    this.buttonsBlur.classList.add('blur');
    this.setTextAndState(this.likeAllBtn, chrome.i18n.getMessage('stopLikeAllBtn'), 'true')
  }

  showStopAlwaysLike() {
    this.setTextAndState(
      this.alwaysLikeBtn,
      chrome.i18n.getMessage('stopAlwaysLikeBtn'),
      'true'
    );
    this.hideElement(this.alwaysDislikeBtn);
  }

  showStopAlwaysDislike() {
    this.setTextAndState(
      this.alwaysDislikeBtn,
      chrome.i18n.getMessage('stopAlwaysDislikeBtn'),
      'true'
    );
    this.hideElement(this.alwaysLikeBtn);
  }

  addButtonsOnClickEvent() {
    addButtonsOnClickEvent(this);
  }
}

function getWhenReact(thePage) {
  chrome.storage.sync.get(['whenReactInPercent'], function(result) {
    thePage.reactingInfo.innerText = chrome.i18n.getMessage(
      'reactingIn',
      (result.whenReactInPercent * 100).toString()
    );
    thePage.showElement(thePage.reactingInfo);
  });
}

function addButtonsOnClickEvent(thePage) {
  thePage.likeAllBtn.onclick = function() {
    if(thePage.likeAllBtn.getAttribute('alreadySubscribed') == 'false'){
      console.log('startLikeAll');
      sendMessage('startLikeAll');
      thePage.showStopLikeAll()
      trackEvent(thePage.name.textContent, 'startLikeAll');
    }else {
      console.log('stopLikeAll');
      sendMessage('stopLikeAll');
      thePage.showLikeAll();
      trackEvent(thePage.name.textContent, 'startLikeAll');
    }
  }

  thePage.alwaysLikeBtn.onclick = function() {
    if (thePage.alwaysLikeBtn.getAttribute('alreadySubscribed') == 'false') {
      // start always like
      sendMessage('startAlwaysLike');
      trackEvent(thePage.name.textContent, 'startAlwaysLike');
      thePage.showStopAlwaysLike();
    } else {
      // stop always like
      sendMessage('stopAlwaysLike');
      trackEvent(thePage.name.textContent, 'stopAlwaysLike');
      thePage.showStartAlwaysBoth();
    }
  };
  thePage.alwaysDislikeBtn.onclick = function() {
    if (thePage.alwaysDislikeBtn.getAttribute('alreadySubscribed') == 'false') {
      // start always dislike
      sendMessage('startAlwaysDislike');
      trackEvent(thePage.name.textContent, 'startAlwaysDislike');
      thePage.showStopAlwaysDislike();
    } else {
      // stop always dislike
      sendMessage('stopAlwaysDislike');
      trackEvent(thePage.name.textContent, 'stopAlwaysDislike');
      thePage.showStartAlwaysBoth();
    }
  };
  thePage.subscribeBtn.onclick = function() {
    sendMessage('clickSubscribeBtn');
    if (thePage.subscribeBtn.getAttribute('subscribed') == 'false') {
      trackEvent(thePage.name.textContent, 'subscribe');
      thePage.setSubscribeBtnSubscribed();
    } // else is not needed because to confirm subscription is needed to confirm and popup will close anyway
    else {
      trackEvent(thePage.name.textContent, 'unsubscribe');
    }
  };
}

function sendMessage(message) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true
    },
    getTabInfo
  );

  function getTabInfo(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message);
  }
}

let page = new Page(); // create a page
sendMessage('loadingPopup'); // send message to content script

chrome.runtime.onMessage.addListener(reciveMessage);

function reciveMessage(message, sender, sendResponse) {
  console.log(sender);
  if (sender !== undefined && sender.tab !== undefined && sender.tab.active) {
    console.log(message);
    if (message.type == 'stopLoading') {
      page.hideElement(page.loadingIcon);
    } else if (message.type == 'hasInfo') {
      console.log(message)
      page.hideElement(page.supportBtn);
      page.hideElement(page.loadingIcon);
      page.showElement(page.divideLine);
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

  setTimeout(function() {
    img.src = '../imgs/refresh.png';
  }, 600);
}

var _AnalyticsCode = 'UA-134153603-1';
var _gaq = _gaq || [];
_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

function trackButtonClick(e) {
  _gaq.push(['_trackEvent', e.target.className, 'clicked']);
  console.log(e.target);
  console.log(' class ' + e.target.className);
}

function trackEvent(name, event) {
  _gaq.push(['_trackEvent', name, event]);
}

document.addEventListener('DOMContentLoaded', function() {
  itens = [
    'support',
    'subscribe',
    'refresh',
    'likeAll',
    'alwaysLike',
    'alwaysDislike',
    'configureExtensionBtn'
  ];
  for (item of itens) {
    let button = document.getElementById(item);
    if (button !== null && button !== undefined) {
      button.addEventListener('click', trackButtonClick);
      console.log(button);
    }
  }
});
