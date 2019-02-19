let installBtn = document.getElementById("installBtn");
installBtn.onclick = function (){
    chrome.webstore.install();
}


let hash = window.location.hash;
if (hash == '#thanks' || hash == '#share') {

    document.getElementById('messagePop').setAttribute('show', 'true');

    if (hash == '#thanks') {
        document.querySelector('#messagePop > p.thanks').setAttribute('show', 'true');
    } else {
        document.querySelector('#messagePop > p.share').setAttribute('show', 'true');
    }
}

document.querySelector('#messagePop > img.closeImg').onclick = function () {
    document.getElementById('messagePop').setAttribute('show', 'false');
}

if (!window.chrome) {
    document.getElementById('installBtn').setAttribute("show", "false");
    document.getElementById('noChrome').setAttribute("show", "true");
}

let menuMobile = document.getElementById("menuMobileOpen");
menuMobile.onclick = function () {
    let menuIcon = this.innerText;
    let nav = document.getElementsByTagName("nav")[0];
    if (menuIcon == "☰ ＋") {
        nav.classList.remove('hideMobile');
        this.innerText = "☰ ➖";
    } else {
        nav.classList.add('hideMobile');
        this.innerText = "☰ ＋";
    }

};

function menuReact(e) {
    let menuIcon = menuMobile.innerText;
    if (menuIcon == "☰ ➖") {
        let nav = document.getElementsByTagName("nav")[0];
        nav.classList.add('hideMobile');
        menuMobile.innerText = "☰ ＋";
    }
}

let menu = document.getElementById('menu');
for (item of menu.getElementsByTagName('li')) {
    item.addEventListener('click', menuReact);
}