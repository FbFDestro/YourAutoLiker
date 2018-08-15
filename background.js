chrome.tabs.onUpdated.addListener(avisa);
function avisa(tabId, changeInfo, tabInfo){
	console.log(changeInfo);
	if(changeInfo.status == "complete"){
		chrome.tabs.sendMessage(tabId, "statusComplete");
		console.log(tabId);
	}
}

/*
chrome.runtime.onInstalled.addListener(function (object) {
	chrome.tabs.create({url: chrome.extension.getURL('index.html')}, function (tab) {
		console.log("New tab launched with http://yoursite.com/");
	});
});
*/