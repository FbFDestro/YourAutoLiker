class ChannelInfo {
  constructor(name, image, subscribeBtn) {
    this.name = name;
    this.image = image;
    this.subscribeBtn = subscribeBtn;
  }
}

class Page {
  constructor() {
    this.typeOfPage = undefined;
    this.channelInfo = undefined;
    this.loadedLists = false;
    this.likeSet = new Set(); // set of channels that the videos should be liked
    this.dislikeSet = new Set(); // set of channels that the videos should be disliked
    this.likeAll = false;
  }

  clear() {
    this.typeOfPage = undefined;
    this.channelInfo = undefined;
  }

  setChannelInfo(channelInfo) {
    this.channelInfo = channelInfo;
    sendMessageWithInfo(); // after setting channel info, send a message to popup with info
  }

  addAlwaysLike() {
    this.likeSet.add(this.channelInfo.name);
  }
  addAlwaysDislike() {
    this.dislikeSet.add(this.channelInfo.name);
  }

  deleteAlwaysLike() {
    this.likeSet.delete(this.channelInfo.name);
  }
  deleteAlwaysDislike() {
    this.dislikeSet.delete(this.channelInfo.name);
  }

  toString() {
    if (this.channelInfo !== undefined) {
      return 'Name: ' + this.channelInfo.name;
    }
    return 'Empty';
  }
}

let page = new Page();

isExtensionWebsite();

chrome.runtime.onMessage.addListener(getMessage);

function getMessage(message, sender, sendResponse) {
  console.log(message);
  if (message == 'pageUpdated') {
    reactOnVideoPage();
    console.log('message');
  } else if (message == 'loadingPopup' || message == 'popupRequestRefresh') {
    if (
      window.location.hostname != 'www.youtube.com' ||
      window.location.pathname == '/'
    ) {
      sendMessageStopLoading();
    } else {
      if (message == 'popupRequestRefresh') {
        console.log('request refresh.');
        page.loadedLists = false;
      }
      reactOnTypeOfPage();
    }
  }else if(message == 'startLikeAll'){
    startLikeAll()
  } else if(message == 'stopLikeAll'){
    stopLikeAll()
  } else if (message == 'startAlwaysLike') {
    startAlwaysLike();
  } else if (message == 'stopAlwaysLike') {
    stopAlwaysLike();
  } else if (message == 'startAlwaysDislike') {
    startAlwaysDislike();
  } else if (message == 'stopAlwaysDislike') {
    stopAlwaysDislike();
  } else if (message == 'clickSubscribeBtn') {
    if (page.channelInfo !== undefined) {
      page.channelInfo.subscribeBtn.click();
    }
  }
}

function sendMessage(message) {
  chrome.runtime.sendMessage(message);
}

function sendMessageStopLoading() {
  sendMessage({
    type: 'stopLoading'
  });
}

function sendMessageWithInfo() {
  sendMessage({
    type: 'hasInfo',
    data: {
      name: page.channelInfo.name,
      image: page.channelInfo.image,
      isSubscribed: page.channelInfo.subscribeBtn.hasAttribute('subscribed'),
      pageType: page.typeOfPage
    },
    statusLikeDislike: {
      likeAll: page.likeAll,
      alwaysLike: page.likeSet.has(page.channelInfo.name),
      alwaysDislike: page.dislikeSet.has(page.channelInfo.name)
    }
  });
}

function sendMessageWithoutInfo() {
  sendMessage({
    type: 'pageHasNoInfoYet'
  });
}

// identify when youtube page finish to load

try {
  document
    .getElementsByTagName('body')[0]
    .addEventListener('yt-navigate-finish', reactOnVideoPage);
} catch (e) {
  console.log('No body element');
}

function reactOnVideoPage() {
  console.log('react on video page');
  page.clear();
  if (
    window.location.hostname == 'www.youtube.com' &&
    window.location.pathname.startsWith('/watch')
  ) {
    page.typeOfPage = '/watch';
    loadLists(getElementsOfVideo, true); // load lists and wait 2 second to get elements (true)
  }
}

function isExtensionWebsite() {
  if (window.location.hostname == 'yourautoliker.com') {
    // if it is the extension website CHANGE

    try {
      document.getElementById('installBtn').setAttribute('show', 'false');

      let menuConf = document.getElementsByClassName('menuConfBtn')[0];
      let menuInstall = document.getElementsByClassName('menuInstallBtn')[0];

      menuConf.setAttribute('show', 'true');
      menuInstall.setAttribute('show', 'false');
      let menuConfLink = menuConf.getElementsByTagName('a')[0];
      menuConfLink.innerText = chrome.i18n.getMessage('configurations');

      menuConfLink.onclick = function() {
        sendMessage({
          type: 'openOptionsPage'
        });
      };
    } catch (e) {
      console.log('no elements found on site');
    }
  }
}

function reactOnTypeOfPage() {
  console.log('react on type of page');
  page.clear();

  if (window.location.hostname == 'www.youtube.com') {
    let possibleTypesOfPages = {
      '/watch': getElementsOfVideo,
      '/channel': getElementsOfChannel,
      '/c': getElementsOfChannel,
      '/user': getElementsOfChannel,
      '/playlist': getElementsOfPlaylist
    };

    for (let type in possibleTypesOfPages) {
      if (window.location.pathname.startsWith(type)) {
        page.typeOfPage = type;
        loadLists(possibleTypesOfPages[type], false);
        /* load the lists and get elements from the page without waiting 2 second */
        break;
      }
    }
  }
}

function loadLists(getElements, wait) {
  // load the list of channels and than get elements of the page
  console.log('Load lists');

  let timeToWait = 0;
  if (wait) {
    timeToWait = 2000;
  }

  /*     Only load lists if they are not loaded yet
            maybe occour problems when the lists are changed on configuration page (is needed to reaload)
     */
  if (!page.loadedLists) {
    chrome.storage.sync.get(null, result => {
      if (result.likeList !== undefined) page.likeSet = new Set(result.likeList);
      if (result.dislikeList !== undefined) page.dislikeSet = new Set(result.dislikeList);
      page.likeAll = result.likeAll

      console.log('Lista de likes: ' + result.likeList);
      console.log('Lista de dislikes: ' + result.dislikeList);
      console.log('Like All: ' + result.likeAll);

      page.loadedLists = true;
      setTimeout(getElements, timeToWait); // waiting is needed for the elements loading
    });
  } else {
    setTimeout(getElements, timeToWait);
  }
}

/*
    Knowing that is a video page, it must try to get elements of the page, however,
    the elements of the page can be not loaded yet or can be inaccessible due to
    old versions of Youtube.
*/
function getElementsOfVideo() {
  console.log('is video debug');

  try {
    // may be needed to use others selectors in others versions of Youtube
    let name = document.querySelector('#upload-info > #channel-name').innerText.trim();
    let image = document.querySelector('.ytd-video-owner-renderer > img').src;
    let subscribeBtn = document.querySelector("#subscribe-button > ytd-subscribe-button-renderer > tp-yt-paper-button")

    if (subscribeBtn === null) {
      // in case of not being logged
      subscribeBtn = document.querySelector(
        '#subscribe-button > ytd-button-renderer > a'
      );
    }

    let channelInfo = new ChannelInfo(name, image, subscribeBtn);
    page.setChannelInfo(channelInfo);

    addEventListenerTimeUpdate();
    //doLikeOrDislike();

    console.log('Find info from video\n' + page);
  } catch (error) {
    console.log("Didn't find elements");
  }
}

function addEventListenerTimeUpdate() {
  if (page.typeOfPage == '/watch') {
    console.log('adding event');
    let video = document.querySelector('.video-stream');

    chrome.storage.sync.get(['whenReactInPercent'], function(result) {
      video.ontimeupdate = function() {
        if (document.querySelector('.ad-showing') === null) {
          // is not an ad
          let whenReact = video.duration * result.whenReactInPercent; // define the time that should react
          whenReact = Math.min(whenReact, video.duration - 1); // react at most 1 second before ending video
          onVideoTimeUpdate(video, whenReact);
        }
        console.log(video.currentTime);
      }; // run code that verify is will try to react on video
    });
  }
}

function onVideoTimeUpdate(video, whenReact) {
  if (video.currentTime > whenReact) {
    console.log('like' + video.currentTime);
    video.ontimeupdate = null; // stop listener
    doLikeOrDislike();
  }
}

function doLikeOrDislike() {
  if (page.typeOfPage == '/watch') {
    let likeBtn = document.querySelector(
      '#top-level-buttons > ytd-toggle-button-renderer:nth-child(1) > a > #button'
    );
    let dislikeBtn = document.querySelector(
      '#top-level-buttons > ytd-toggle-button-renderer:nth-child(2) > a > #button'
    );

    if (
      likeBtn.classList.contains('style-default-active') ||
      dislikeBtn.classList.contains('style-default-active')
    ) {
      console.log('O video ja recebeu um like ou dislike!\n');
    } else if (
      page.channelInfo !== undefined &&
      page.likeSet.has(page.channelInfo.name) || page.likeAll
    ) {
      likeBtn.click();
      trackEventSend('like');
    } else if (
      page.channelInfo !== undefined &&
      page.dislikeSet.has(page.channelInfo.name)
    ) {
      dislikeBtn.click();
      trackEventSend('dislike');
    }
  }
}

function trackEventSend(reaction) {
  // capture name of the video and send event to analytics
  try {
    let videoName = document.querySelector('.title > .ytd-video-primary-info-renderer')
      .textContent;
    sendMessage({
      type: 'trackEvent',
      name: page.channelInfo.name,
      reaction: reaction,
      videoName: videoName
    });
  } catch (e) {
    // problems cathing the name of the video
    console.log('Nome não capturado');
  }
}

function getElementsOfChannel() {
  console.log('is channel');
  try {
    let name = document.querySelector('#channel-name').innerText.trim();

    let image = document.querySelector('#channel-header-container > yt-img-shadow > img')
      .src;
    let subscribeBtn = document.querySelector(
      '#subscribe-button > ytd-subscribe-button-renderer > paper-button'
    );
    document.querySelector(
      '#channel-header-container > #subscribe-button > ytd-subscribe-button-renderer > paper-button'
    );

    let channelInfo = new ChannelInfo(name, image, subscribeBtn);
    page.setChannelInfo(channelInfo);

    console.log('Find info from channel\n' + page);
  } catch (error) {
    console.log("Didn't find elements");
  }
}

function getElementsOfPlaylist() {
  console.log('is playlist');
  try {
    let name = document.querySelector('#text > a').innerText.trim();

    let image = document.querySelector(
      '#owner-container > #video-owner > ytd-video-owner-renderer > a > #avatar > img'
    ).src;
    let subscribeBtn = document.querySelector(
      '#owner-container > #button > ytd-subscribe-button-renderer > paper-button'
    );

    let channelInfo = new ChannelInfo(name, image, subscribeBtn);
    page.setChannelInfo(channelInfo);

    console.log('Find info from playlist\n' + page);
  } catch (error) {
    console.log("Didn't find elements");
  }
}

function startAlwaysLike() {
  if (page.channelInfo !== undefined) {
    page.addAlwaysLike();
  }
  saveLikeSetChanges();
}

function startAlwaysDislike() {
  if (page.channelInfo !== undefined) {
    page.addAlwaysDislike();
  }
  saveDislikeSetChanges();
}

function stopAlwaysLike() {
  if (page.channelInfo !== undefined) {
    page.deleteAlwaysLike();
  }
  saveLikeSetChanges();
}

function stopAlwaysDislike() {
  if (page.channelInfo !== undefined) {
    page.deleteAlwaysDislike();
  }
  saveDislikeSetChanges();
}

function saveLikeSetChanges() {
  var likeList = Array.from(page.likeSet);
  chrome.storage.sync.set(
    {
      likeList: likeList
    },
    function() {
      console.log('Lista de like salva como: ' + likeList);
      addEventListenerTimeUpdate();
      //doLikeOrDislike(); // tem que estar dentro para evitar problemas de sincronização
    }
  );
}

function saveDislikeSetChanges() {
  var dislikeList = Array.from(page.dislikeSet);
  chrome.storage.sync.set(
    {
      dislikeList: dislikeList
    },
    function() {
      console.log('Lista de dislike salva como: ' + dislikeList);
      addEventListenerTimeUpdate();
      //doLikeOrDislike(); // tem que estar dentro para evitar problemas de sincronização
    }
  );
}

function startLikeAll() {
  page.likeAll = true;
  chrome.storage.sync.set(
    {
      likeAll: page.likeAll
    },
    function() {
      console.log('Like all: ' + page.likeAll);
      addEventListenerTimeUpdate();
    }
  );
}
function stopLikeAll() {
  page.likeAll = false;
  chrome.storage.sync.set(
    {
      likeAll: page.likeAll
    },
    function() {
      console.log('Stopped linking all: ' + page.likeAll);
      addEventListenerTimeUpdate();
    }
  );
}

