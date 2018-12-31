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
        if (this.channelInfo !== undefined) { return 'Name: ' + this.channelInfo.name; }
        return 'Empty';
    }
}

let page = new Page();

chrome.runtime.onMessage.addListener(getMessage);
function getMessage(message, sender, sendResponse) {
    if (message == 'pageUpdated') {
        reactOnTypeOfPage();
        sendMessageWithoutInfo();
        page.channelInfo = undefined;
        console.log('message');
    } else if (message == 'loadingPopup') {

        if(window.location.hostname != 'www.youtube.com' || window.location.pathname == '/'){
            sendMessageStopLoading();
        }else if (page.channelInfo !== undefined) {
        /*
            when page changes and you are in other tab, youtube doesn't insert the image
            it happend when you are watching videos with auto-play
        */
            if(page.typeOfPage ==  '/watch' && page.channelInfo.image == ''){
                page.channelInfo.image = document.querySelector('.ytd-video-owner-renderer > img').src;
            }
            sendMessageWithInfo();
        } else { // page has no objects to iteract with yet
            sendMessageWithoutInfo();
        }

    } else if (message == 'startAlwaysLike') {
        startAlwaysLike();
    } else if (message == 'stopAlwaysLike') {
        stopAlwaysLike();
    } else if (message == 'startAlwaysDislike') {
        startAlwaysDislike();
    } else if (message == 'stopAlwaysDislike') {
        stopAlwaysDislike();
    }else if(message == 'clickSubscribeBtn'){
        if(page.channelInfo !== undefined) {
            page.channelInfo.subscribeBtn.click();
        }
    }
}

function sendMessage(message) {
    chrome.runtime.sendMessage(message);
}

function sendMessageStopLoading(){
    sendMessage({type: 'stopLoading'});
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
            alwaysLike: page.likeSet.has(page.channelInfo.name),
            alwaysDislike: page.dislikeSet.has(page.channelInfo.name)
        }
    });
}

function sendMessageWithoutInfo() {
    sendMessage({ type: 'pageHasNoInfoYet' });
}


// identify when youtube page finish to load
try{
    document.getElementsByTagName('body')[0].addEventListener('yt-navigate-finish', reactOnTypeOfPage);
}catch {
    console.warn('No body element');
}

function reactOnTypeOfPage() {
    console.log('ativado');
    page.clear();

    if (window.location.hostname == 'www.youtube.com') {
        let possibleTypesOfPages = {
            '/watch': getElementsOfVideo,
            '/channel': getElementsOfChannel,
            '/user': getElementsOfChannel,
            '/playlist': getElementsOfPlaylist,
        };

        for (let type in possibleTypesOfPages) {
            if (window.location.pathname.startsWith(type)) {
                page.typeOfPage = type;
                loadLists(possibleTypesOfPages[type]); // load the lists and get elements from the page
                break;
            }
        }
    }
}

function loadLists(getElements) { // load the list of channels and than get elements of the page
    console.log('Load lists');

    if (!page.loadedLists) {
        chrome.storage.sync.get(null, (result) => {
            if (result.likeList !== undefined) page.likeSet = new Set(result.likeList);
            if (result.dislikeList !== undefined) page.dislikeSet = new Set(result.dislikeList);

            console.log('Lista de likes: ' + result.likeList);
            console.log('Lista de dislikes: ' + result.dislikeList);

            page.loadedLists = true;
            setTimeout(getElements, 2000); // waiting is needed for the elements loading
        });
    } else {
        setTimeout(getElements, 2000);
    }

}

/*
    Knowing that is a video page, it must try to get elements of the page, however,
    the elements of the page can be not loaded yet or can be inaccessible due to
    old versions of Youtube.
*/
function getElementsOfVideo() {
    console.log('is video');

    try {
        // may be needed to use others selectors in others versions of Youtube
        let name = document.getElementById('owner-container').innerText;
        let image = document.querySelector('.ytd-video-owner-renderer > img').src;
        let subscribeBtn = document.querySelector('#subscribe-button.ytd-video-secondary-info-renderer > ytd-subscribe-button-renderer > paper-button');

        let channelInfo = new ChannelInfo(name, image, subscribeBtn);
        page.setChannelInfo(channelInfo);

        addEventListenerTimeUpdate();
        //doLikeOrDislike();

        console.log('Find info from video\n' + page);
    } catch (error) {
        console.log('Didn\'t find elements');
    }
}

function addEventListenerTimeUpdate() {
    if (page.typeOfPage == '/watch') {
        let video = document.querySelector('.video-stream');

        chrome.storage.sync.get(['whenReactInPercent'], function (result) {
            let whenReact = video.duration * result.whenReactInPercent; // define the time that should react
            whenReact = Math.min(whenReact, video.duration-1); // react at most 1 second before ending video
            video.ontimeupdate = function () { onVideoTimeUpdate(video, whenReact) }; // run code that verify is will try to react on video
        });
    }
}

function onVideoTimeUpdate(video, whenReact) {
    if (video.currentTime > whenReact) {
        video.ontimeupdate = null; // stop listener
        doLikeOrDislike();
    }
}

function doLikeOrDislike() {
    if (page.typeOfPage == '/watch') {
        let likeBtn = document.querySelector('#top-level-buttons > ytd-toggle-button-renderer:nth-child(1) > a > #button');
        let dislikeBtn = document.querySelector('#top-level-buttons > ytd-toggle-button-renderer:nth-child(2) > a > #button');

        if (likeBtn.getAttribute('aria-pressed') == 'true' || dislikeBtn.getAttribute('aria-pressed') == 'true') {
            console.log('O video ja recebeu um like ou dislike!\n');
        } else if (page.likeSet.has(page.channelInfo.name)) {
            likeBtn.click();
        } else if (page.dislikeSet.has(page.channelInfo.name)) {
            dislikeBtn.click();
        }
    }
}

function getElementsOfChannel() {
    console.log('is channel');
    try {
        let name = document.getElementById('channel-title').innerText;
        let image = document.querySelector('#channel-header-container > yt-img-shadow > img').src;
        let subscribeBtn = document.querySelector('#channel-header-container > #subscribe-button > ytd-subscribe-button-renderer > paper-button');

        let channelInfo = new ChannelInfo(name, image, subscribeBtn);
        page.setChannelInfo(channelInfo);

        console.log('Find info from channel\n' + page);

    } catch (error) {
        console.log('Didn\'t find elements');
    }

    // load name of channel
}

function getElementsOfPlaylist() {
    console.log('is playlist');
    try {
        let name = document.getElementById('owner-name').innerText;
        let image = document.querySelector('.ytd-video-owner-renderer > #img.yt-img-shadow').src;
        let subscribeBtn = document.querySelector('#owner-container > #button > ytd-subscribe-button-renderer > paper-button');

        let channelInfo = new ChannelInfo(name, image, subscribeBtn);
        page.setChannelInfo(channelInfo);

        console.log('Find info from playlist\n' + page);

    } catch (error) {
        console.log('Didn\'t find elements');
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
    chrome.storage.sync.set({ "likeList": likeList }, function () {
        console.log('Lista de like salva como: ' + likeList);
        addEventListenerTimeUpdate();
        //doLikeOrDislike(); // tem que estar dentro para evitar problemas de sincronização
    });
}
function saveDislikeSetChanges() {
    var dislikeList = Array.from(page.dislikeSet);
    chrome.storage.sync.set({ "dislikeList": dislikeList }, function () {
        console.log('Lista de dislike salva como: ' + dislikeList);
        addEventListenerTimeUpdate();
        //doLikeOrDislike(); // tem que estar dentro para evitar problemas de sincronização
    });
}