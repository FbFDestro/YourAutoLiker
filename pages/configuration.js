class Page{
    constructor(){
        this.slider = document.getElementById('myRange');
        this.whenReact = document.getElementsByClassName('percent')[0];
        this.sliderStartValue = undefined;
        this.likeList = undefined;
        this.dislikeList = undefined;
        this.likeContent = document.querySelector('.like > .content-box');
        this.dislikeContent = document.querySelector('.dislike > .content-box');
        this.saveBtn = document.querySelector('.save > .content-box > .btn');
    }

    getListsValue(){
        getListsValue(this);
    }

    setChangesToBeSaved(){
        this.saveBtn.innerText = 'ROLA';
    }

}

function getSliderValue(){
    chrome.storage.sync.get(['whenReactInPercent'], function (result) {
        page.sliderStartValue = result.whenReactInPercent;
        setSliderValue();
    });
}

function setSliderValue() {
    console.log(page.sliderStartValue);
    page.slider.value = page.sliderStartValue*100;
    page.whenReact.innerHTML = page.slider.value + '%';
    page.slider.oninput = function () {
        page.whenReact.innerText = page.slider.value + '%';
        if(page.slider.value != page.sliderStartValue){
            page.setChangesToBeSaved();
        }
    }
}

function getListsValue(){
    chrome.storage.sync.get(null, (result) => {
        page.likeList = result.likeList;
        page.dislikeList = result.dislikeList;

        console.log('Lista de likes: ' + page.likeList);
        console.log('Lista de dislikes: ' + page.dislikeList);
        
        iterateListCreatingButtons(page.likeList, page.likeContent);
        iterateListCreatingButtons(page.dislikeList, page.dislikeContent);
    });
}

function iterateListCreatingButtons(list, content){
    const addSrc = '../imgs/add.png';
    const removeSrc = '../imgs/remove.png';
     if (list !== undefined) {
        for (let i = 0; i < list.length; i++) {
            let btn = document.createElement('div');
            btn.classList.add('btn');
            btn.innerHTML = '<p>' + list[i].slice(0, -1) + '</p><img src="' + removeSrc + '">';
            btn.onclick = function () {
                let icon = btn.querySelector('img');
                if (icon.src.endsWith(removeSrc.substr(2, removeSrc.length))) {
                    icon.src = addSrc;
                } else {
                    icon.src = removeSrc;
                }
                btn.classList.toggle('removed');
            }
            content.append(btn);
        }
    }
}


let page = new Page();
getSliderValue();
getListsValue();