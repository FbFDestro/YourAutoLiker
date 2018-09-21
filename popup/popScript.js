function sendMsg(msg){
		chrome.tabs.query({active: true, currentWindow: true},pegouTab);
		function pegouTab(tabs){
		chrome.tabs.sendMessage(tabs[0].id, msg);
		}
}

function inserirMenu(id,nomeImg,texto){

	var divBtn = document.createElement("div");
	divBtn.setAttribute("id",id);
	divBtn.setAttribute("class","btn");

	divBtn.innerHTML = "<div class='icone'><img src='../imgs/"+nomeImg+".png' /></div><a href='#'>"+texto+"</a></div>"

	console.log(botoes);
	botoes.prepend(divBtn); // não funciona em versões antigas
	return divBtn;
}

function exibeExistenteMenu(elemeto){
	menu.prepend(elemento);
}
function removeMenu(elemento){
	elemento.parentNode.removeChild(elemento);
}

function botoesNovoLikeDislike(){
	// insere de cima para baixo
	var btnAddDislike = inserirMenu("btnDislike","dislike","Sempre dar dislike nesse canal");
	var btnAddLike = inserirMenu("btnLike","like","Sempre dar like nesse canal");

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

function botaoPararLike(){
	var btnRemoveLike = inserirMenu("btnRemoveLike","like","Parar de dar like nesse canal"); // posso mudar o "like" para "pararLike" se eu mudar a imagem
	btnRemoveLike.onclick = function() {
		sendMsg("rmGosto");
		removeMenu(btnRemoveLike);
		botoesNovoLikeDislike();
	}
}
function botaoPararDislike(){
	var btnRemoveDislike = inserirMenu("btnRemoveDislike","dislike","Parar de dar dislike nesse canal");
	btnRemoveDislike.onclick = function() {
		sendMsg("rmDisgosto");
		removeMenu(btnRemoveDislike);
		botoesNovoLikeDislike();
	}
}

window.onload = function(){

	sendMsg("infoRequest");

	botoes = document.getElementById("botoes");
	loadIcon = document.querySelector(".icone.load");

	titulo = document.getElementById("nome");

	console.log(botoes);

	chrome.runtime.onMessage.addListener(recebeMsg);
	function recebeMsg(msg, sender, sendResponse){

		if(msg.tipo < 0){ // so deve aparecer o botão de configurar a extensão

			loadIcon.style.display = "none"; // escondendo o loading
			// hide loading button

		}else if((msg.id == "nome" || msg.id == "carregou")) { // deve avaliar o canal e possibilitar sempre gostar e desgostar ou desinscrever

			loadIcon.style.display = "none"; // escondendo o loading
			botoes.prepend(document.createElement("hr")); // exibe linha dividindo a opção de carregar
			titulo.innerText = msg.valor;


			console.log(msg);
			// hide loading button

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

