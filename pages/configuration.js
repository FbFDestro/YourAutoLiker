class Page{
    constructor(){
        this.slider = document.getElementById('myRange');
        this.whenReact = document.getElementsByClassName('percent')[0];
        this.setSliderValue();
    }
    setSliderValue(){
        setSliderValue(this);
    }

}

function setSliderValue(thePage) {
    thePage.whenReact.innerHTML = thePage.slider.value + '%';
    thePage.slider.oninput = function () {
        thePage.whenReact.innerText = thePage.slider.value + '%';
    }
}

let page = new Page();