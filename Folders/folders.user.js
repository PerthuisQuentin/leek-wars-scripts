// ==UserScript==
// @name		  [Leek Wars] Editor Folders v2
// @namespace	  https://github.com/Ebatsin/Leek-Wars/
// @version		  0.1
// @description	  Ajoute la possibilité de créer des dossiers pour ranger vos IA
// @author		  Twilight
// @projectPage	  https://github.com/Ebatsin/Leek-Wars/
// @updateURL	  https://github.com/Ebatsin/Leek-Wars/raw/master/Multi%20Account%20Manager/MultiAccountManager.user.js
// @downloadURL	  https://github.com/Ebatsin/Leek-Wars/raw/master/Multi%20Account%20Manager/MultiAccountManager.user.js
// @match		  http://leekwars.com/*
// @grant		  none
// ==/UserScript==

(function() {
	var lang_newFolder    = 'Nouveau dossier';
	var lang_newFile      = 'Nouveau fichier';
	var lang_createFolder = 'Nouveau dossier';
	var lang_createFile   = 'Nouveau fichier';
	var lang_delete       = 'Supprimer';
	var lang_rename       = 'Renommer';
	var lang_sendTo       = 'Transférer';

	/**
	*	@brief Récupère les options dans le localStorage
	*/
	function getSettings() {
		if(localStorage.getItem('EF.settings') === null) {
			saveSettings({
				'fold': true, // fermé par défaut
			});
		}
		return JSON.parse(localStorage.getItem('EF.settings'));
	}

	/**
	*	@brief Sauvegarde les options dans le localStorage
	*/
	function saveSettings(settings) {
		localStorage.setItem('EF.settings', JSON.stringify(settings));
	}

	/**
	*	@brief Classe représentant les dossiers
	*/
	function Directory(data) {
		this.name = data.name || lang_newFolder; // nom de la directory, genre 'folder'
		this.pathName = data.pathName || null; // chemin vers la directory, genre 'folder1/folder2/'
		this.dirChildren = [];
		this.fileChildren = [];

		this.distToRoot; // distance à la racine (racine = 0)
		this.folded = true; // si la directory est ouverte ou non

		/**
		*	@brief Essaye de renommer le dossier
		*	@param newName Le nouveau nom du dossier
		*	@param callback Fonction prenant en paramètre un booleen indiquant si le changement de nom a réussi ou pas, ainsi que le data reçu.
		*
		*	Envoie une requête à l'API pour renommer le dossier (renomme les fichiers à l'intérieur). En cas de l'échec d'au moins un renommage,
		*	le renommage est annulé et les fichiers déja modifiés reprennent leurs noms d'origine.
		*	Il est de plus impossible d'effectuer un nouveau renommage pendant le batch de renommage actuel
		*/
		this.rename = function(newName, callback) { // tentative de renommage de la directory
			if(isValidName(newName)) {
				this.name = newName;
				// renommage des pathName
			}
		};

		/**
		*	@brief Affiche un invite de saisie afin que l'utilisateur entre le nouveau nom. Appelle automatiquement rename
		*	@param callback Le callback a passer à rename
		*/
		this.askRename = function(callback) {

		};

		/**
		*	@brief Supprime le dossier ainsi que tout ce qu'il contient.
		*
		*	Demande confirmation avant de supprimer le dossier et ses descendants
		*/
		this.delete = function() {

		};

		/**
		*	@brief Déplace le dossier ainsi que tout ce qu'il contient de sa position d'origine vers une nouvelle position
		*	@param newPath Le nouveau chemin du dossier
		*
		*	La destination du déplacement ne peut pas être un dossier enfant
		*	Un déplacement nécessite un appel à rename. Un appel à l'API est donc nécessaire. En cas d'échec de déplacement d'un fichier
		*	(nom déja existant), il sera proposé de : le renommer, remplacer l'original, abandonner le déplacement
		*/
		this.moveTo = function(newPath) {

		};

		/**
		*	@brief Crée un nouveau dossier dans le dossier actuel
		*	@return Le nom du dossier créé
		*
		*	Le nom par défaut est la chaine lang_newFolder suivit d'un numéro si nécessaire
		*/
		this.createFolder = function() {

		};

		/**
		*	@brief Crée un nouveau fichier dans le dossier actuel
		*	@return Le nom du fichier créé
		*
		*	Le nom par défaut est la chaine lang_newFile suivit d'un numéro si nécessaire et du format 'ls'
		*/
		this.createFile = function() {

		};

		/**
		*	@brief Ajoute un dossier déja créé à ce dossier
		*	@param folder Le dossier à ajouter
		*
		*	En cas d'échec, l'ajout est annulé
		*/
		this.addFolder = function(folder) {

		};

		/**
		*	@brief Ajoute un fichier déja créé à ce dossier
		*	@brief file Le fichier à ajouter
		*
		*	En cas d'échec, l'ajout est annulé
		*/
		this.addFile = function(file) {

		};

		/**
		*	@brief Sauvegarde toutes les infos importantes sur cette directory dans le local storage
		*/
		this.saveSettings = function() {

		};

		/**
		*	@brief Récupère la configuration du dossier depuis le localStorage
		*
		*	Contient les noms des dossiers enfants vides
		*/
		this.loadSettings = function() {

		};

		/**
		*	@brief retourne un élément grâce à son chemin
		*	@param path Le chemin vers l'élement. Un dossier doit avoir un chemin se terminant par '/'
		*
		*	@return L'élement voulu
		*/
		this.getFromPath = function(path) {

		};

		/**
		*	@brief Ferme le dossier
		*/
		this.fold = function() {

		};

		/**
		*	@brief Ouvre le dossier
		*/
		this.unfold = function() {

		};

		/**
		*	@brief Si le dossier est ouvert, le ferme, et inversement
		*/
		this.toggleFold = function() {

		};
	}

	function Directory() {
		this.name; // nom du fichier, genre 'file'
		this.pathName; // chemin vers le fichier, genre 'folder1/folder2/'
		this.renamable = true; // si le fichier peut être renommable
		this.lvl; // le niveau de l'IA du  fichier
		this.id; // l'ID de l'IA du fichier
		this.charCount; // nombre de caractères du fichier
		this.lineCount; // nombre de lignes du fichier
		this.valid; // Si l'IA est valide ou non

		this.distToRoot; // distance à la racine (racine = 0)

		/**
		*	@brief essaye de renommer le fichier
		*	@param newName Le nouveau nom du fichier
		*	@param callback Fonction prenant en paramètre un booleen indiquant si le changement de nom a réussi ou pas, ainsi que le data reçu.
		*/
		this.rename = function(newName, callback) { // tentative de renommage du fichier

		};

		/**
		*	@brief permet à l'utilisateur de saisir un nouveau nom qui est ensuite utilisé comme nouveau nom
		*	@param callback Le callback a passer à rename
		*/
		this.askRename = function(callback) {

		};

		/**
		*	@brief Supprime le fichier. Demande confirmation avant
		*/
		this.delete = function() {

		};

		/**
		*	@brief Déplace le fichier vers un autre endroit
		*	@param newPath Le nouveau chemin du fichier
		*/
		this.moveTo = function(newPath) {

		};

		/**
		*	@brief Crée un nouveau dossier dans le dossier actuel
		*/
		this.createFolder = function() {

		};

		/**
		*	@brief Crée un nouveau fichier dans le dossier actuel
		*/
		this.createFile = function() {

		};

		/**
		*	@brief Ajoute un dossier déja créé au dossier actuel
		*	@param folder Le dossier à ajouter
		*/
		this.addFolder = function(folder) {

		};

		/**
		*	@brief Ajoute un fichier déja créé au dossier actuel
		*	@brief file Le fichier à ajouter
		*/
		this.addFile = function(file) {

		};

		/**
		*	@brief Sauvegarde toutes les infos importantes sur ce fichier dans le local storage
		*/
		this.saveSettings = function() {

		};

		/**
		*	@brief Récupère la configuration du fichier depuis le localStorage
		*/
		this.loadSettings = function() {

		};

		/**
		*	@brief Charge une IA via son id
		*	@param ia L'id de l'ia
		*/
		this.loadIA = function(ia) {

		};
	}

	/**
	*	@brief découpe un chemin en une suite de déplacement atomique
	*	@param path Le chemin vers l'élément à accéder.
	*
	*	@return 'folder/folder2/folder3/file' -> ['folder/', 'folder2/', 'folder3/', 'file']
	*/
	function splitPath(path) {
		var sp = path.split('/');
		var lastIsFile = sp[sp.length - 1].length != 0;
		var r = [], sz = sp.length - 1;
		for(var i = 0; i < sz; ++i) {
			r.push(sp[i] + '/');
		}

		if(lastIsFile) r.push(sp[sz]);
		return r;
	}

	function isValidName(name) {
		return name.indexOf('/') === -1;
	}
})();