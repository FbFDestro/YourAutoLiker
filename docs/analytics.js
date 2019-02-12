var _AnalyticsCode = 'UA-134153603-2';
var _gaq = _gaq || [];
_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);

(function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

function trackButtonClick(e) {

    let className;
    if (e.target.className == 'installBtn') {
        className = e.target.className;
    } else {
        className = e.target.parentNode.className;
    }

    _gaq.push(['_trackEvent', className, 'clicked']);
    console.log(' class ' + className);
}

document.addEventListener('DOMContentLoaded', function () {
    let menu = document.getElementById('menu');
    for (item of menu.getElementsByTagName('li')) {
        item.addEventListener('click', trackButtonClick);
    }
    document.getElementById('installBtn').addEventListener('click', trackButtonClick);
    let donatePaypal = document.querySelector('#paypal > form > input[type="image"]:nth-child(3)');
    donatePaypal.parentNode.classList.add('donatePaypal');
    donatePaypal.addEventListener('click', trackButtonClick);
});