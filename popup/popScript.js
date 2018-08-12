
function sendMsg(msg){
	chrome.tabs.query({active: true, currentWindow: true},pegouTab);
	function pegouTab(tabs){
		chrome.tabs.sendMessage(tabs[0].id, msg);
	}
}

window.onload = function(){

	sendMsg("infoRequest");

	var btnAddLike = document.getElementById("addLike");
	var btnAddDislike = document.getElementById("addDislike");


	chrome.runtime.onMessage.addListener(recebeMsg);
	function recebeMsg(msg, sender, sendResponse){
		if(msg.id == "fimInfo" || msg.id == "nome") {
			console.log(msg);
			btnAddLike.innerText = "Sempre gostar de: "+ msg.valor;
			btnAddDislike.innerText = "Sempre gostar de: "+ msg.valor;
		}
	}


	btnAdd.onclick = function() {
		sendMsg("nvGosto");
		console.log("oi\n");
	}


}
