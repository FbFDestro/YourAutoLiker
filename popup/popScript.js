function sendMsg(msg){
/*	chrome.tabs.query({active: true, currentWindow: true},pegouTab);
	function pegouTab(tabs){
		chrome.tabs.sendMessage(tabs[0].id, msg);
	}
	*/
}

function inserirMenu(id,nomeImg,texto){

	var divBtn = document.createElement("div");
	divBtn.setAttribute("id",id);
	divBtn.setAttribute("class","btn");

	var divIcone = document.createElement("div");
	divIcone.setAttribute("class", "icone");

	var img = document.createElement("img");
	img.src = "../imgs/"+nomeImg+".png";

	var link = document.createElement("a");
	link.href = "#";
	link.innerText = texto;

	divIcone.appendChild(img);
	divBtn.appendChild(divIcone);
	divBtn.appendChild(link);

	console.log(botoes);
	botoes.prepend(divBtn); // não funciona em versões antigas
	return divBtn;


	/*
	var liElement = document.createElement("li");
	var aElement = document.createElement("a");
	aElement.href = "#";
	aElement.innerText = texto;
	aElement.setAttribute("id", id);
	liElement.appendChild(aElement);
	menu.prepend(liElement);
	return liElement;
	*/
}

function exibeExistenteMenu(elemeto){
	menu.prepend(elemento);
}
function removeMenu(elemento){
	elemento.parentNode.removeChild(elemento);
}

function botoesNovoLikeDislike(nome){
	// insere de cima para baixo
	var btnAddDislike = inserirMenu("Sempre não gostar de: " + nome,"addDislike");
	var btnAddLike = inserirMenu("Sempre gostar de: " + nome,"addLike");

	btnAddLike.onclick = function() {
		sendMsg("nvGosto");
		removeMenu(btnAddDislike);
		removeMenu(btnAddLike);
		botaoPararLike(nome);
	}
	btnAddDislike.onclick = function(){
		sendMsg("nvDisgosto");
		removeMenu(btnAddDislike);
		removeMenu(btnAddLike);
		botaoPararDislike(nome);
	}
}

function botaoPararLike(nome){
	var btnRemoveLike =  inserirMenu("Parar de gostar de: " + nome,"removeLike");
	btnRemoveLike.onclick = function() {
		sendMsg("rmGosto");
		removeMenu(btnRemoveLike);
		botoesNovoLikeDislike(nome);
	}
}
function botaoPararDislike(nome){
	var btnRemoveDislike =  inserirMenu("Parar de não gostar de: " + nome,"removeDislike");
	btnRemoveDislike.onclick = function() {
		sendMsg("rmDisgosto");
		removeMenu(btnRemoveDislike);
		botoesNovoLikeDislike(nome);
	}
}

window.onload = function(){

	sendMsg("infoRequest");

	botoes = document.getElementById("botoes");
	console.log(botoes);

	/*

	menu = document.getElementById("opcoes");
	var confExt = inserirMenu("Configurar extensão","confExt");
	var loadExt = inserirMenu("Carregando informações","loadExt");

	*/

	botoes.prepend(document.createElement("hr"));
	var btnAddDislike = inserirMenu("btnDislike","dislike","Sempre dar dislike nesse canal");
	var btnAddLike = inserirMenu("btnLike","like","Sempre dar like nesse canal");


//	var btnAddLike = document.getElementById("addLike");
//	var btnAddDislike = document.getElementById("addDislike");

	chrome.runtime.onMessage.addListener(recebeMsg);
	function recebeMsg(msg, sender, sendResponse){

		if(msg.tipo < 0){ // so deve aparecer o botão de configurar a extensão
			removeMenu(loadExt);
		}else if((msg.id == "nome" || msg.id == "carregou")) { // deve avaliar o canal e possibilitar sempre gostar e desgostar ou desinscrever

			console.log(msg);
			removeMenu(loadExt);

			if(msg.gostaDesgosta == 0){ // ja gosta
				botaoPararLike(msg.valor);
			}else if(msg.gostaDesgosta == 1) { // ja desgosta
				botaoPararDislike(msg.valor);
			}else { // ainda não sempre gosta nem desgosta do canal
				botoesNovoLikeDislike(msg.valor);
			}
		}
	}



}

