class Page{

    constructor(){
        this.pageType = -2; // define o tipo da página (inicialmente página não carregada)

        this.likeBtn = null; // objeto do botão de like
        this.dislikeBtn = null; // objeto do botão de dislike
        this.channelName = null; // armazena o nome do canal, se existir
    }

    clear(){ // preciso ver se isso é realmente necessário depois
        this.pageType = -2;
        this.likeBtn = null; 
        this.dislikeBtn = null;
        this.dislikeBtn = null;
    }
    

    verifyType(){ // aqui analiso o tipo de pagina para poder tentar ou não pegar os elementos
        

    }




}