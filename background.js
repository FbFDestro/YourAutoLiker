chrome.tabs.onUpdated.addListener(avisa);
function avisa(tabId, changeInfo, tabInfo){
	console.log(changeInfo);
	if(changeInfo.status == "complete"){
		chrome.tabs.sendMessage(tabId, "statusComplete");
		console.log(tabId);
	}
}
