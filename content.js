var listasCarregadas = false; // só preciso carregar na primeira vez
var listaLike = [];
var listaDislike = ["Felipe Neto", "Irmãos Neto"];

chrome.runtime.onMessage.addListener(pegaMensagem);
function pegaMensagem(msg, sender, sendResponse){ // recebe mensagens do background e popup
	console.log(msg);
	if(msg == "statusComplete"){

		console.log("veioDoMudou");
		if(!listasCarregadas){
			console.log("carrega listas");
			listasCarregadas = true;
			carregarListas();
		}
		setTimeout(likeDislike,5000); // espera 1 segundo (ir para a próxima página de fato)

	}else if(msg == "nvGosto"){
		salvaNovo();
	}
}

function salvarLista() {
	chrome.storage.sync.set({"listaLike": listaLike}, function() {
		console.log('Lista de like salva como: ' + listaLike);
		if (chrome.runtime.error) {
			console.log("Runtime error.");
		}
		likeDislike();
	});
}

function carregarListas() {
	chrome.storage.sync.get(['listaLike'], function(result) {
		console.log('Lista de like carregada: ' + result.listaLike);
		if(result.listaLike !== undefined) {
			if(result.listaLike.length == 0){ // se tiver vazio coloco as listas iniciais que eu quero
				listaLike = ["Desempedidos","Fabio F. Destro"];
				salvarLista();
			}else{
				listaLike = result.listaLike;		
			}
		}
	});
}

function salvaNovo(){
	var nomeCanal = getNomeCanal();
	if(nomeCanal === null){
		console.log("O nome não foi encontrado!\n");
		return;
	}
	console.log("Salvando novo canal para a lista de Likes: " + nomeCanal);
	listaLike.push(nomeCanal.substr(0,nomeCanal.length-1));
	salvarLista();
}

function likeDislike(){
	var likeBtn = getLikeBtn();
	var dislikeBtn = getDislikeBtn();
	var nomeCanal = getNomeCanal();

	if(likeBtn === null || dislikeBtn === null || nomeCanal === null){
		console.log("Algum elemento não foi encontrado na página do vídeo!\n");
		return;
	}else if(likeBtn.getAttribute("aria-pressed") == "true" || dislikeBtn.getAttribute("aria-pressed") == "true"){
		console.log("O video ja recebeu um like ou dislike!\n");
		return;
	}
	console.log("Nome do canal: " + nomeCanal);

	for(var i=0;i<listaLike.length;i++){
		if((listaLike[i]+"\n") == nomeCanal){
			likeBtn.click();
			console.log("Você deu um like nesse vídeo\n");
			return;
		}
	}

	for(var i=0;i<listaDislike.length;i++){
		if((listaDislike[i]+"\n") == nomeCanal){
			dislikeBtn.click();
			console.log("Voce deu um dislike nesse vídeos\n");
			return;
		}
	}
}

function getLikeBtn(){
	return document.querySelector('#top-level-buttons > ytd-toggle-button-renderer:nth-child(1) > a > #button');
}

function getDislikeBtn(){
	return document.querySelector('#top-level-buttons > ytd-toggle-button-renderer:nth-child(2) > a > #button');
}

function getNomeCanal(){
	var elementoNome = document.getElementById('owner-container');
	if(elementoNome === null) return null;
	return elementoNome.innerText;
}

