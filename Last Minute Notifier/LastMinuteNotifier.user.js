// ==UserScript==
// @name          [Leek Wars] Last Minute Notifier
// @namespace	  https://github.com/Ebatsin/Leek-Wars/
// @version       0.9.3
// @description   Permet d'être averti quelques temps avant minuit si il reste des combats
// @author        Twilight
// @projectPage   https://github.com/Ebatsin/Leek-Wars/
// @updateURL     https://github.com/Ebatsin/Leek-Wars/raw/master/Last%20Minute%20Notifier/LastMinuteNotifier.user.js
// @downloadURL   https://github.com/Ebatsin/Leek-Wars/raw/master/Last%20Minute%20Notifier/LastMinuteNotifier.user.js
// @match         http://leekwars.com/*
// @grant         none
// ==/UserScript==

/*
*	Disclaimer : Je passe une demie-heure à chaque changement d'heure pour savoir dans quel sens on doit tourner l'aiguille selon si on avance ou on recule d'heure
*	Il est donc possible qu'il y ai des erreurs dues aux différentes timezone. Si le script ne fait pas ce qu'il doit faire, envoyez moi un MP, je corrigerai ça
*/

(function() {

	// pour changer le nombre de minutes avant minuit, ouvrir la console du navigateur (F12 dans chrome et firefox)
	// dans l'onglet 'console', entrez : 
	// LMN_setTimeBeforeMidnight(20)
	// cela affichera la notification 20 minutes avant minuit

	window.LMN_setTimeBeforeMidnight = function(minutes) {
		if(typeof minutes === 'number') {
			minutes = Math.abs(minutes % 1440); // 1440 minutes dans un jour
			localStorage.setItem('LMN-pop-time', minutes);
			LMN_minutesBeforeMidnight = minutes;
			clearTimeout(LMN_currentTimeout);
			LMN_createNotifEvent();
			return true;
		}
		return false;
	};

	var LMN_name = "Last Minute Notifier",
		LMN_message = "Il est tard et il te reste des combats, pense à aller les faire !",
		LMN_fail = "Suite à une erreur, il n'y aura pas d'annonce de fin de journée pour vos combats",
		LMN_OKMsg = "OK", // toi aussi crée des variables utiles
		LMN_toGardenMsg = "Aller au potager",
		LMN_minutesBeforeMidnight = 20, // nombre de minutes avant minuit avant lesquelles la notif apparaîtra
		LMN_drop, LMN_content, LMN_footer, LMN_cancel, LMN_toGarden, LMN_title, LMN_serverOffset, LMN_serverTime, LMN_currentTimeout;

	var LMN_updateServerTime = function(callback) {
		$.getJSON('http://api.geonames.org/timezoneJSON?formatted=true&lat=43.577244&lng=7.055041&username=demo&style=full', function(data) {
			if(data.dstOffset === undefined) {
				console.log('[LMN] Impossible d\'accéder au serveur de temps');
				// on présuppose qu'on est en france
				LMN_serverOffset =  0;
				LMN_serverTime = new Date();
				callback(LMN_serverTime);
			}
			else {
				LMN_serverOffset = 3600000 * (((new Date()).getTimezoneOffset() / -60) - data.dstOffset);
				LMN_serverTime = new Date(Date.now() - LMN_serverOffset);
				callback(LMN_serverTime);
			}
		});
	};

	var LMN_getNextNotifDate = function() {
		var LMN_todayTime = new Date();
		LMN_todayTime.setDate(LMN_todayTime.getDate() + 1);
		LMN_todayTime.setHours(0, 0, 0, 0);
		LMN_todayTime = new Date(LMN_todayTime.getTime() - LMN_minutesBeforeMidnight * 60000 - LMN_serverOffset);

		if (LMN_todayTime.getTime() > LMN_serverTime.getTime()) {
			return LMN_todayTime;
		} 
		else {
			LMN_todayTime.setDate(LMN_todayTime.getDate() + 1);
			return LMN_todayTime;
		}
	};

	var LMN_createNotifEvent = function() {
		LMN_updateServerTime(function(serverTime) {
			LMN_currentTimeout = setTimeout(function() {
				_.get('garden/get/$', function(data) {
					if(data.success) {
						if(data.garden.solo_fights + data.garden.farmer_fights + data.garden.team_fights > 0) {
							LMN_popNotif(LMN_message);
						}
					}
					else {
						LMN_popNotif(LMN_fail);
					}
				});
				setTimeout(LMN_createNotifEvent, 5000);
			}, LMN_getNextNotifDate().getTime() - serverTime.getTime());
			var LMN_tmp = LMN_getNextNotifDate();
			window._LMN_next_pop = "[Last Minute Notifier] Le " + LMN_tmp.getDate() + ' à ' + LMN_tmp.getHours() + ':' + LMN_tmp.getMinutes();
		});
};

	var LMN_popNotif = function(message) {
		LMN_content.text(message);
		LMN_drop.css('top', 0);
	};

	var LMN_hideNotif = function() {
		LMN_drop.css('top', -LMN_drop.outerHeight());
	};

	var LMN_initDropdown = function() {
		if(LW.farmer.id === undefined) {
			setTimeout(LMN_initDropdown, 1000);
			return;
		}
		
		// création du dropdown
		LMN_drop = $(document.createElement('div'))
						.css({width: '70%', position: 'fixed', left: '15%', top: '-1000px', 'background-image': 'url("http://leekwars.com/static/image/background.png")', 'z-index': 2000, 'transition': 'ease 0.6s top'})
						.appendTo(document.body);
		LMN_title = $(document.createElement('div'))
						.text(LMN_name)
						.css({'text-align': 'center', height: '3em', 'line-height': '3em', 'font-size': '2em', color: 'white', background: 'hsla(0, 0%, 100%, 0.2)'})
						.appendTo(LMN_drop);
		LMN_content = $(document.createElement('div'))
						.css({padding: '1.5em', color: 'white', 'font-size': '1.5em', 'text-align': 'center'})
						.appendTo(LMN_drop);
		LMN_footer = $(document.createElement('div'))
						.appendTo(LMN_drop);
		LMN_cancel = $(document.createElement('button'))
						.text(LMN_OKMsg)
						.css({width: '50%', background: '#555', padding: '0.6em', color: '#eee', 'text-align': 'center', border: 'none', 'font-size': '1.5em', cursor: 'pointer'})
						.click(LMN_hideNotif)
						.hover(function() {
							LMN_cancel.css('background', '#777');
						}, function() {
							LMN_cancel.css('background', '#555');
						})
						.appendTo(LMN_footer);
		LMN_toGarden = $(document.createElement('button'))
						.text(LMN_toGardenMsg)
						.css({width: '50%', background: '#5FAD1B', padding: '0.6em', color: '#eee', 'text-align': 'center', border: 'none', 'font-size': '1.5em', cursor: 'pointer'})
						.click(function() {
							LMN_hideNotif();
							LW.page('/garden');
						})
						.hover(function() {
							LMN_toGarden.css('background', '#73D120');
						}, function() {
							LMN_toGarden.css('background', '#5FAD1B');
						})
						.appendTo(LMN_footer);

		LMN_hideNotif();
		LMN_createNotifEvent(); // on initialise l'event
	};
	
	LMN_minutesBeforeMidnight = parseInt(localStorage.getItem('LMN-pop-time')) || LMN_minutesBeforeMidnight;

	LMN_initDropdown();
})();
