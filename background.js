chrome.tabs.onUpdated.addListener(sendMessage);

function sendMessage(tabId, changeInfo, tabInfo) {
	console.log(changeInfo);

	console.log(tabInfo);
	if (changeInfo.status == "complete") {
		chrome.tabs.sendMessage(tabId, "pageUpdated");
		console.log(tabId);
	}
}

chrome.runtime.onMessage.addListener(getMessage);

function getMessage(message, sender, sendResponse) {
	if (message.type == 'openOptionsPage') {
		chrome.runtime.openOptionsPage();
	}
}

chrome.runtime.onInstalled.addListener(function (object) {
	chrome.storage.sync.set({
		'whenReactInPercent': 0.80
	});
	chrome.tabs.create({
		url: 'http://yourautoliker.com/#use'
	});
});

chrome.runtime.setUninstallURL('http://yourautoliker.com/saiba-mais#contato');