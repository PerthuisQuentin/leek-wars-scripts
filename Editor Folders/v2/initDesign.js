// on charge la page. On annule tous ce qui pourrait être fait
LW.on('pageload', function() {
	if(LW.currentPage === "editor") {
		LW.pages.editor.init = function(){
			console.log('Redirection editeur en cours');
		};
	}
});