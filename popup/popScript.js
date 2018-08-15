function sendMsg(msg){
	chrome.tabs.query({active: true, currentWindow: true},pegouTab);
	function pegouTab(tabs){
		chrome.tabs.sendMessage(tabs[0].id, msg);
	}
}

function inserirMenu(texto,id){
	var liElement = document.createElement("li");
	var aElement = document.createElement("a");
	aElement.href = "#";
	aElement.innerText = texto;
	aElement.setAttribute("id", id);
	liElement.appendChild(aElement);
	menu.prepend(liElement);
	return liElement;
}

function exibeExistenteMenu(elemeto){
	menu.prepend(elemento);
}
function removeMenu(elemento){
	elemento.parentNode.removeChild(elemento);
}

window.onload = function(){

	sendMsg("infoRequest");

	menu = document.getElementById("opcoes");
	var confExt = inserirMenu("Configurar extensão","confExt");
	var loadExt = inserirMenu("Carregando informações","loadExt");

//	var btnAddLike = document.getElementById("addLike");
//	var btnAddDislike = document.getElementById("addDislike");

	chrome.runtime.onMessage.addListener(recebeMsg);
	function recebeMsg(msg, sender, sendResponse){

		if(msg.tipo < 0){

			removeMenu(loadExt);

		}else if((msg.id == "nome" || msg.id == "carregou")) {

			console.log(msg);
			removeMenu(loadExt);

			// insere de cima para baixo
			var btnAddDislike = inserirMenu("Sempre não gostar de: " + msg.valor,"addDislike");
			var btnAddLike = inserirMenu("Sempre gostar de: " + msg.valor,"addLike");

			btnAddLike.onclick = function() {
				sendMsg("nvGosto");
				console.log("oi\n");
			}

			btnAddDislike.onclick = function(){
				sendMsg("nvDisgosto");
			}

		}
	}



}
