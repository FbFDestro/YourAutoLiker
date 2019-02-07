chrome.tabs.onUpdated.addListener(sendMessage);

function sendMessage(tabId, changeInfo, tabInfo) {
	console.log(changeInfo);

	if (changeInfo.status == "complete") { // se a aba acabou de ser atualizada
		chrome.tabs.sendMessage(tabId, "pageUpdated");
		console.log(tabId);
	}
}

//ESTA COMENTADO PORQUE ESSA FUNCIONALIDADE SÓ SERA ATIVADA DEPOIS
chrome.runtime.onInstalled.addListener(function (object) {
	chrome.storage.sync.set({
		'whenReactInPercent': 0.80
	});
	/* 	chrome.tabs.create({url: chrome.extension.getURL('index.html')}, function (tab) {
			console.log("New tab launched with http://yoursite.com/");
		}); */
});