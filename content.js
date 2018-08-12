var listasCarregadas = false; // só preciso carregar na primeira vez
var listaLike = [];
var listaDislike = ["Felipe Neto", "Irmãos Neto"];

// informacoes que vou varrer da tela
var likeBtn = null;
var dislikeBtn = null;
var nomeCanal = null;

chrome.runtime.onMessage.addListener(pegaMensagem);
function pegaMensagem(msg, sender, sendResponse){ // recebe mensagens do background e popup

	console.log(msg);

	if(msg == "statusComplete"){ // mensagem do background avisando que carregou a nova página

		console.log("veioDoMudou");
		if(!listasCarregadas){
			console.log("carrega listas");
			carregarListas();
			listasCarregadas = true;
		}
		setTimeout(getInfo, 1000); // navega pela página pegando as informaçoes possiveis
		setTimeout(likeDislike,5000); // espera 3 segundo (ir para a próxima página de fato)

	}else if(msg == "nvGosto"){

		salvaNovo();

	}else if(msg == "infoRequest"){
		if(nomeCanal === null) getInfo(); // caso as informacoes não tenham sido carregadas ainda. tenta carregar
		var mens = {
			id: "nome",
			valor: nomeCanal
		}
		chrome.runtime.sendMessage(mens);
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
	if(nomeCanal === null){
		console.log("O nome não foi encontrado!\n");
		return;
	}
	console.log("Salvando novo canal para a lista de Likes: " + nomeCanal);
	listaLike.push(nomeCanal.substr(0,nomeCanal.length-1));
	salvarLista();
}

function likeDislike(){

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

function getInfo(){
	
	nomeCanal = getNomeCanal(0); // tenta pegar o nome do canal usando uma pagina do canal
	if(nomeCanal != null) return; // se for null, esta em um video ou em outra pagina que não tem o nome do canal

	likeBtn = getLikeBtn();
	dislikeBtn = getDislikeBtn();
	nomeCanal = getNomeCanal(1);
	console.log("Tenta pegar informacoes " + likeBtn + " " + dislikeBtn + " " + nomeCanal);
	var mens = {
		id: "fimInfo"
	}
	chrome.runtime.sendMessage(mens);
	if(likeBtn === null || dislikeBtn === null || nomeCanal === null) setTimeout(getInfo, 5000);
}

function getLikeBtn(){
	return document.querySelector('#top-level-buttons > ytd-toggle-button-renderer:nth-child(1) > a > #button');
}

function getDislikeBtn(){
	return document.querySelector('#top-level-buttons > ytd-toggle-button-renderer:nth-child(2) > a > #button');
}

function getNomeCanal(tipo){
	var buscaElemento;
	if(tipo == 0) {
		buscaElemento = "channel-title";
		console.log("title");
	}else{
		buscaElemento = "owner-container";
		console.log("owner");
	}
	var elementoNome = document.getElementById(buscaElemento);
	console.log(elementoNome);
	if(elementoNome !== null) return elementoNome.innerText;
	return null;
}
