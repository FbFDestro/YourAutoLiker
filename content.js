var listasCarregadas = false; // só preciso carregar na primeira vez
var likeSet = new Set();
var dislikeSet = new Set();

// informacoes que vou varrer da tela
var likeBtn,dislikeBtn,nomeCanal,nomePlaylist,paginaCarregou,tipoPagina;
function inicializaVars(){
	likeBtn = null;
	dislikeBtn = null;
	nomeCanal = null;
	nomePlaylist = null;
	paginaCarregou = false;
	tipoPagina = -2; // sem informacoes
}

chrome.runtime.onMessage.addListener(pegaMensagem);
function pegaMensagem(msg, sender, sendResponse){ // recebe mensagens do background e popup

	console.log(msg);

	if(msg == "statusComplete"){ // mensagem do background avisando que carregou a nova página

		console.log("veioDoMudou");
		inicializaVars();

		setTimeout(runOnPage,5000); // espera 5 segundos (para os elementos carregarem)

	}else if(msg == "nvGosto"){
		adicionar(0);
		//salvaNovo(0);
	}else if(msg == "nvDisgosto"){

		adicionar(1);

	}else if(msg == "rmGosto"){
		remover(0);	
	}else if(msg == "rmDisgosto"){
		remover(1);
	}else if(msg == "infoRequest"){
		// PODE SER QUE AINDA NÃO TENHA A INFORMAÇÃO
	//	if(nomeCanal === null) getInfo(); // caso as informacoes não tenham sido carregadas ainda. tenta carregar
		if(paginaCarregou){
			
			var jaGostaDesgosta = -1;
			if(likeSet.has(nomeCanal)) jaGostaDesgosta = 0;
			else if(dislikeSet.has(nomeCanal)) jaGostaDesgosta = 1;
			
			chrome.runtime.sendMessage({id: "nome",valor: nomeCanal,gostaDesgosta: jaGostaDesgosta,tipo: tipoPagina});
		}else {
			chrome.runtime.sendMessage({id: "carregando"});
		}
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

	tipoPagina = verifyTypeOfPage(); 
	paginaCarregou = true;

	chrome.runtime.sendMessage({id: "carregou",valor: nomeCanal,tipo: tipoPagina}); // avisa para o popup que terminou

	if(tipoPagina >= 0 && !listasCarregadas) { // se for video/playlist ou canal tem que carregar as listas
		console.log("carrega listas");
		carregarListas();
		listasCarregadas = true;
	}
	
	if(tipoPagina > 0) { // se for video tenta dar like
		likeDislike();
	}

	//setTimeout(getInfo, 2000); // navega pela página pegando as informaçoes possiveis
}


function salvarLista(tipo) {

	if(tipo == 0){
		var likeArr = Array.from(likeSet);
		chrome.storage.sync.set({"likeArr": likeArr}, function() {
			console.log('Lista de like salva como: ' + likeArr);
			likeDislike(); // tem que estar dentro para evitar problemas de sincronização
		});
	}else if(tipo == 1){

		var dislikeArr = Array.from(dislikeSet);
		chrome.storage.sync.set({"dislikeArr": dislikeArr}, function() {
			console.log('Lista de dislike salva como: ' + dislikeArr);
			likeDislike();
		});

	}
}

function carregarListas() {

	chrome.storage.sync.get(null, function(result) {
		if(result.likeSet !== undefined) likeSet = new Set(result.likeArr);
		if(result.dislikeSet !== undefined) dislikeSet = new Set(result.dislikeArr);
		console.log(result.likeArr);
		console.log(result.dislikeArr);
	});

}

function adicionar(tipo){
	if(nomeCanal !== null){
		if(tipo == 0){  // CERTO PARA DEPOIS MUDAR
			likeSet.add(nomeCanal);
			console.log("Salvando novo canal para a lista de Likes: " + nomeCanal);
		}else if (tipo == 1){
			dislikeSet.add(nomeCanal);
			console.log("Salvando novo canal para a lista de Dislikes: " + nomeCanal);
		}else { // playlist

		}
		salvarLista(tipo);
	}
}

function remover(tipo){
	if(nomeCanal !== null){
		if(tipo == 0){  // CERTO PARA DEPOIS MUDAR
			likeSet.remove(nomeCanal);
			console.log("Removendo o canal da lista de Likes: " + nomeCanal);
		}else if (tipo == 1){
			dislikeSet.remove(nomeCanal);
			console.log("Removendo o canal da lista de Dislikes: " + nomeCanal);
		}else { // playlist

		}
		salvarLista(tipo);
	}
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

	if(likeSet.has(nomeCanal)){
		likeBtn.click();
		return;
	}

	if(dislikeSet.has(nomeCanal)){
		dislikeBtn.click();
		if(nomeCanal == "Felipe Neto\n"){ // so para ter um jeito de limpar as listas por enquanto! :)
			likeSet.clear();
			dislikeSet.clear();
			salvarLista(0);
			salvarLista(1);
			console.log("Esse canal fez tudo ser apagado!");
		}
		return;
	}

}

///// VERIFICA FIM DO CARREGAMENTO
var progressBar = document.querySelector("yt-page-navigation-progress.style-scope.ytd-app")
function verificaBarra(){

	if(progressBar.getAttribute("hidden") == null) {
		console.log("visivel");
		apareceu = true;
	}else {
		console.log("invisivel");
		if(apareceu){
			console.log("acabou de carregar");
			clearInterval(idVerificaBarra);
		}
	}
}
function carregando(){
	apareceu = false;
	idVerificaBarra = setInterval(verificaBarra, 200);
}
