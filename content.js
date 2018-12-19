class ChannelInfo {
    constructor(name, image, subscribeBtn){
        this.name = name;
        this.image = image;
        this.subscribeBtn = subscribeBtn;
    }
}

class Page {
    constructor(){
        this.typeOfPage = undefined;
        this.channelInfo = undefined;
        this.loadedLists = false;
        this.likeSet = new Set(); // set of channels that the videos should be liked
        this.dislikeSet = new Set(); // set of channels that the videos should be disliked
    }

    clear(){
        this.typeOfPage = undefined;
        this.channelInfo = undefined;
    }

    setChannelInfo(channelInfo){
        this.channelInfo = channelInfo;
    }

    toString(){
        if(this.channelInfo !== undefined)
            return "Name: " + this.channelInfo.name;
        return "Empty";
    }
}

var page = new Page();

// identify when youtube page finish to load 
document.getElementsByTagName("body")[0].addEventListener("yt-navigate-finish", reactOnTypeOfPage);
chrome.runtime.onMessage.addListener(getMessage);

function getMessage(message, sender, sendResponse){

    if(message == "pageUpdated"){ // era onde eu identificava que a pagina mudou, agora uso o evento
       // reactOnTypeOfPage();
        console.log("message");
    }else if(message == "popupRequestInfo"){
        if(page.typeOfPage === undefined){ // page has no objects to iteract with
            
        }else {

        }
    }

}

function reactOnTypeOfPage() {

    page.clear();

    if (window.location.hostname == "www.youtube.com") {

        let possibleTypesOfPages = {
            "/watch": getElementsOfVideo,
            "/channel": getElementsOfChannel,
            "/playlist": getElementsOfPlaylist
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

function loadLists(getElements){ // load the list of channels and than get elements of the page
    console.log("Load lists");

    if (!page.loadedLists) {
        chrome.storage.sync.get(null, function (result) {
            if (result.likeList !== undefined) page.likeSet = new Set(result.likeList);
            if (result.dislikeList !== undefined) page.dislikeSet = new Set(result.dislikeList);

            console.log("Lista de likes: " + result.likeList);
            console.log("Lista de dislikes: " + result.dislikeList);

            page.loadedLists = true;
            setTimeout(getElements,500);
        });
    }else {
        setTimeout(getElements, 500);
    }

}

/*
    Knowing that is a video page, it must try to get elements of the page, however,
    the elements of the page can be not loaded yet or can be inaccessible due to
    old versions of Youtube.
*/
function getElementsOfVideo(){
    console.log("is video");
    
    try {

        let name = document.getElementById("owner-container").innerText; // sei que é video então pego o nome do canal e os botoes
        let image = document.querySelector("#img.yt-img-shadow").src;
        let subscribeBtn = document.querySelector("#subscribe-button > ytd-subscribe-button-renderer > paper-button");

        let channelInfo = new ChannelInfo(name, image, subscribeBtn);
        page.channelInfo = channelInfo;

        doLikeOrDislike();

        console.log("achou\n" + page);
    } catch{
        console.log("nao achou elementos")
    }

}


function doLikeOrDislike() {
    if (page.typeOfPage == "/watch") {

        let likeBtn = document.querySelector('#top-level-buttons > ytd-toggle-button-renderer:nth-child(1) > a > #button');
        let dislikeBtn = document.querySelector('#top-level-buttons > ytd-toggle-button-renderer:nth-child(2) > a > #button');

        if (likeBtn.getAttribute("aria-pressed") == "true" || dislikeBtn.getAttribute("aria-pressed") == "true") {
            console.log("O video ja recebeu um like ou dislike!\n");
        } else {

            if (page.likeSet.has(page.name)) {
                likeBtn.click();
            } else if (page.dislikeSet.has(page.name)) {
                dislikeBtn.click();
            }

        }

    }
}

function getElementsOfChannel(){
    console.log("is channel");

    // load name of channel
}

function getElementsOfPlaylist(){
    console.log("is playlist")
}





