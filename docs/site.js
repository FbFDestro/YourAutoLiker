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

function trackButtonClick(e) {
    ga('send', 'event', e.target.className, 'clicked');
    /*     _gaq.push(['_trackEvent', e.target.className, 'clicked']); */
    console.log(' class ' + e.target.className);
}

document.addEventListener('DOMContentLoaded', function () {
    let menu = document.getElementById('menu');
    for (item of menu.getElementsByTagName('li')) {
        item.addEventListener('click', trackButtonClick);
    }
    document.getElementById('installBtn').addEventListener('click', trackButtonClick);
});