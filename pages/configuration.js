class Page{
    constructor(){
        this.slider = document.getElementById('myRange');
        this.whenReact = document.getElementsByClassName('percent')[0];
        this.sliderStartValue = undefined;
        this.getSliderValue();

        this.likeList = undefined;
        this.dislikeList = undefined;
        this.getListsValue();

        this.saveBtn = document.querySelector('.save > .content-box > .btn');
    }

    getSliderValue(){
        getSliderValue(this);
    }

    setSliderValue(){
        setSliderValue(this);
    }

    getListsValue(){
        getListsValue(this);
    }

    setChangesToBeSaved(){
        this.saveBtn.innerText = 'ROLA';
    }

}

function getSliderValue(thePage){
    chrome.storage.sync.get(['whenReactInPercent'], function (result) {
        thePage.sliderStartValue = result.whenReactInPercent;
        thePage.setSliderValue();
    });
}

function getListsValue(thePage){
    chrome.storage.sync.get(null, (result) => {
        thePage.likeList = result.likeList;
        thePage.dislikeList = result.dislikeList;

        console.log('Lista de likes: ' + result.likeList);
        console.log('Lista de dislikes: ' + result.dislikeList);
    });
}


function setSliderValue(thePage) {
    console.log(thePage.sliderStartValue);
    thePage.slider.value = thePage.sliderStartValue*100;
    thePage.whenReact.innerHTML = thePage.slider.value + '%';
    thePage.slider.oninput = function () {
        thePage.whenReact.innerText = thePage.slider.value + '%';
        if(thePage.slider.value != thePage.sliderStartValue){
            thePage.setChangesToBeSaved();
        }
    }
}

let page = new Page();