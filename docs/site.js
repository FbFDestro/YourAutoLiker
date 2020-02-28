let hash = window.location.hash;
if (hash == '#thanks' || hash == '#share') {
  document.getElementById('messagePop').setAttribute('show', 'true');
  if (hash == '#thanks') {
    document.querySelector('#messagePop > p.thanks').setAttribute('show', 'true');
  } else {
    document.querySelector('#messagePop > p.share').setAttribute('show', 'true');
  }
}

/*
window.onhashchange = () => {

    console.log("hash changed");
    if (hash == '#comoUsar') {
        document.querySelector('#menu > li.menuHowUseBtn > a').classList.add('active');
    }

}
*/

document.querySelector('#messagePop > img.closeImg').onclick = function() {
  document.getElementById('messagePop').setAttribute('show', 'false');
};

let menuMobile = document.getElementById('menuMobileOpen');
menuMobile.onclick = function() {
  let menuIcon = this.innerText;
  let nav = document.getElementsByTagName('nav')[0];
  if (menuIcon == '☰ ＋') {
    nav.classList.remove('hideMobile');
    this.innerText = '☰ ➖';
  } else {
    nav.classList.add('hideMobile');
    this.innerText = '☰ ＋';
  }
};

function menuReact(e) {
  let menuIcon = menuMobile.innerText;
  if (menuIcon == '☰ ➖') {
    let nav = document.getElementsByTagName('nav')[0];
    nav.classList.add('hideMobile');
    menuMobile.innerText = '☰ ＋';
  }
}

let menu = document.getElementById('menu');
for (item of menu.getElementsByTagName('li')) {
  item.addEventListener('click', menuReact);
}
