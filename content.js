var listasCarregadas = false; // só preciso carregar na primeira vez
var listaLike = [];
var listaDislike = ["Felipe Neto", "Irmãos Neto"];

// informacoes que vou varrer da tela
var likeBtn = null;
var dislikeBtn = null;
var nomeCanal = null;
var nomePlaylist = null;

var paginaCarregou = false;

chrome.runtime.onMessage.addListener(pegaMensagem);
function pegaMensagem(msg, sender, sendResponse){ // recebe mensagens do background e popup

	console.log(msg);

	if(msg == "statusComplete"){ // mensagem do background avisando que carregou a nova página

		console.log("veioDoMudou");
		esperandoCarragar = true;
		setTimeout(runOnPage,5000); // espera 5 segundos (para os elementos carregarem)

	}else if(msg == "nvGosto"){

		salvaNovo();

	}else if(msg == "infoRequest"){
		// PODE SER QUE AINDA NÃO TENHA A INFORMAÇÃO
	//	if(nomeCanal === null) getInfo(); // caso as informacoes não tenham sido carregadas ainda. tenta carregar
		if(paginaCarregou)
			chrome.runtime.sendMessage({id: "nome",valor: nomeCanal});
	}
}

/**
 *	Verifica o tipo da pagina
 *	@return -1,0,1,2 
 *	-1 = não esta em um video nem em um canal -> popoup tem apenas a opção de configurações da extensão
 *	 0 = esta em um canal -> popup pode adicionar/remover das listas (*0)
 *	 1 = esta em um video -> (*0) e curte ou descurte dependendo do canal (*1)
 *	 2 = esta em um vídeo de uma playlist -> (*0) e (*1 dependendo do canal e da playlist)
 */
function verifyTypeOfPage(){
	var ehVideo = document.querySelector("ytd-app[is-watch-page]") !== null ? true : false;
	
	if(ehVideo){

		nomeCanal = document.getElementById("owner-container").innerText; // sei que é video então pego o nome do canal e os botoes
		likeBtn = document.querySelector('#top-level-buttons > ytd-toggle-button-renderer:nth-child(1) > a > #button');
		dislikeBtn = document.querySelector('#top-level-buttons > ytd-toggle-button-renderer:nth-child(2) > a > #button');

		var ehPlaylist = document.querySelector("ytd-playlist-panel-renderer").getAttribute("hidden") !== null ? false : true;
		if(ehPlaylist){
			nomePlaylist = document.querySelector("#header-description .ytd-playlist-panel-renderer").innerText; // sei que é playlist pego o nome dela
			console.log("playlist");
			return 2; // retorno que é playlist (e video)
		}
		console.log("video");
		return 1; // retorno que é video mas não playlist
	}

	if(document.querySelector("ytd-browse[page-subtype='channels']") !== null) { // pode achar mesmo quando não é canal
		var ehCanal = document.querySelector("ytd-browse[page-subtype='channels']").getAttribute("hidden") !== null ? false : true;

			if(ehCanal) {
				nomeCanal = document.getElementById("channel-title").innerText; // sei que é canal e preencho com seu nome
				console.log("canal");
				return 0;
			}
	}

	console.log("pagina sem informacao do canal");
	return -1; // não tem a informação do canal em questão porque não é video nem canal!
}

function runOnPage(){

	var tipoPagina = verifyTypeOfPage(); 
	paginaCarregou = true;

	chrome.runtime.sendMessage({id: "carregou",valor: nomeCanal});

	if(tipoPagina >= 0 && !listasCarregadas) { // se for video/playlist ou canal tem que carregar as listas
		console.log("carrega listas");
		carregarListas();
		listasCarregadas = true;
	}
	
	if(tipoPagina > 0) { // se for video tenta dar like
		setTimeout(likeDislike,5000); // espera 5 segundo (ir para a próxima página de fato)
	}

	//setTimeout(getInfo, 2000); // navega pela página pegando as informaçoes possiveis
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

