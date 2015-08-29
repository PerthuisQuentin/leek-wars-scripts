// ==UserScript==
// @name		  [Leek Wars] Fav
// @namespace	 https://github.com/Ebatsin/Leek-Wars/
// @version		0.1
// @description	Permet de placer en favori, des joueurs, des leeks, des alliances, des combats et des tournois
// @author		Twilight
// @projectPage	https://github.com/Ebatsin/Leek-Wars/
// -@updateURL	 https://github.com/Ebatsin/Leek-Wars/raw/master/Multi%20Account%20Manager/MultiAccountManager.user.js
// -@downloadURL	https://github.com/Ebatsin/Leek-Wars/raw/master/Multi%20Account%20Manager/MultiAccountManager.user.js
// @match		 http://leekwars.com/*
// @grant		 none
// ==/UserScript==

// à changer : 
// message est en fait [message, groupe], afin d'assigner des favs à des groupes
// récupérer l'id: LW.pages['fight'].scope (pour le fight, à changer pour leek, etc)

//(function() {
	var favType = Object.freeze({
		FAV_FARMER: 1,
		FAV_LEEK: 2,
		FAV_TEAM: 3,
		FAV_FIGHT: 4,
		FAV_TOURNAMENT: 5
	});

	var favLink = Object.freeze({
		'farmer': favType.FAV_FARMER,
		'leek': favType.FAV_LEEK,
		'team': favType.FAV_TEAM,
		'fight': favType.FAV_FIGHT,
		'tournament': favType.FAV_TOURNAMENT
	});

	var favId = Object.freeze({ // serait bien si on pouvait connaître l'id de la page actuelle
		0: function() {return 0;},
		1: function() {return parseInt(document.location.toString().substr(document.location.toString().lastIndexOf('/') + 1));},
		2: function() {
			// page d'accueil est également une page de leek
			if(document.location.toString() === 'http://leekwars.com' || document.location.toString() === 'http://leekwars.com/') {
				return LW.farmer.leeks[Object.keys(LW.farmer.leeks)[0]].id;
			}
			else return parseInt(document.location.toString().substr(document.location.toString().lastIndexOf('/') + 1));
		},
		3: function() {return parseInt(document.location.toString().substr(document.location.toString().lastIndexOf('/') + 1));},
		4: function() {return parseInt(document.location.toString().substr(document.location.toString().lastIndexOf('/') + 1));},
		5: function() {return parseInt(document.location.toString().substr(document.location.toString().lastIndexOf('/') + 1));}
	});

	if(!localStorage.getItem('FAV.favs')) {
		setFavs((function() { // oui... C'est assez pas propre
			var arrayGen = {};
			Object.keys(favType).forEach(function(index, item) {arrayGen[item] = {};});
			return arrayGen;
		})());
	}
	else if(Object.keys(favType).length !== Object.keys(getFavs()).length) {
		// nouveau type de fav ajouté, on update le tableau dans le localStorage - utile pour compatibilité ultérieure
		var current = getFavs();
		Object.keys(favType).forEach(function(index, item) {
			if(!current[index]) current[index] = {};
		});
		setFavs(current);
	}

	function getFavs() {
		return JSON.parse(localStorage.getItem('FAV.favs'));
	}

	function getFav(type, id) {
		var current = getFavs();
		if(id) return current[type][id];
		else return current[type];
	}

	function setFavs(favs) {
		localStorage.setItem('FAV.favs', JSON.stringify(favs));
	}

	function setFav(type, id, message) {
		var current = getFavs();
		current[type][id] = message;
		setFavs(current);
	}

	function unsetFav(type, id) {
		var current = getFavs();
		delete current[type][id];
		setFavs(current);
	}

	function getCurrentInfo() {
		var type = (favLink[LW.currentPage]) ? favLink[LW.currentPage] : 0;
		return {
			'type': type,
			'id': favId[type]()
		};
	}

	function genStar() {
		$(document.createElement('div')).addClass('tab').text('☆').css({
			'font-size': '2em',
			padding: '0 10px',
			'line-height': '1.2em',
			color: 'white'
		}).attr('data-fav', false).click(function() {
			if($(this).attr('data-fav') == "false") {
				$(this).text('★').css('color', 'yellow');
				$(this).attr('data-fav', true);
			}
			else {
				$(this).text('☆').css('color', 'white');
				$(this).attr('data-fav', false);
			}
		}).prependTo($('.tabs'));
	}

//})();