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