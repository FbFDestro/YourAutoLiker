chrome.tabs.onUpdated.addListener(avisa);
function avisa(tabId, changeInfo, tabInfo){
	console.log(changeInfo);
	if(changeInfo.status == "complete"){
		chrome.tabs.sendMessage(tabId, "statusComplete");
		console.log(tabId);
	}
}

chrome.browserAction.onClicked.addListener(adicionaGostei);
function adicionaGostei(tab){
	console.log(tab);
	chrome.tabs.sendMessage(tab.id,"nvGosto");
}
