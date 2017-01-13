// ==UserScript==
// @name		  [Leek Wars] Last Minute Notifier
// @namespace	 https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @version	   0.9.7
// @description   Permet d'être averti quelques temps avant minuit si il reste des combats
// @author		Twilight
// @projectPage   https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @updateURL	 https://github.com/PerthuisQuentin/Leek-Wars-Scripts/raw/master/Last%20Minute%20Notifier/LastMinuteNotifier.user.js
// @downloadURL   https://github.com/PerthuisQuentin/Leek-Wars-Scripts/raw/master/Last%20Minute%20Notifier/LastMinuteNotifier.user.js
// @match		 *://*.leekwars.com/*
// @grant		 none
// ==/UserScript==
 
/*
*	   Disclaimer : Je passe une demie-heure à chaque changement d'heure pour savoir dans quel sens on doit tourner l'aiguille selon si on avance ou on recule d'heure
*	   Il est donc possible qu'il y ai des erreurs dues aux différentes timezone. Si le script ne fait pas ce qu'il doit faire, envoyez moi un MP, je corrigerai ça
*/
 
(function() {
	var text = {
			name: 'Last Minute Notifier',
			message: 'Il est tard et il te reste des combats, pense à aller les faire !',
			failMessage: 'Suite à une erreur, il n\'y aurai pas d\'annonce de fin de journée pour vos combats',
			ok: 'OK', // toi aussi crée des variables utiles
			toGarden: 'Aller au potager',
	};
	var pop = {
		drop: 0, content: 0, footer: 0, cancel: 0, toGarden: 0, title: 0
	};
	var server = {
		offset: 0, time: 0
	};
	var currentTimeout;
	var minutesBeforeMidnight = getPopTime(20);
	var alreadyShown = localStorage.getItem('LMN.alreadyShown') == "true" || false;
	var alreadyShownDate = localStorage.getItem('LMN.alreadyShownDate') || 0;
   
	function updateServerTime(callback) {
		$.getJSON('http://api.geonames.org/timezoneJSON?formatted=true&lat=43.577244&lng=7.055041&username=demo&style=full', function(data) {
			if(data.dstOffset === undefined) {
				var currentTime = new Date();
				console.error('[LMN] Impossible de se connecter au serveur de temps');
				localStorage.setItem('LMN.log', '[' + currentTime.getDate() + '/' + (currentTime.getMonth() + 1) + ' ' + currentTime.getHours() + ':' + currentTime.getMinutes() + currentTime.getSeconds() + '] Impossible de se connecter au serveur de temps');
				// on présuppose qu'on est en france
				server.offset =  0;
				server.time = new Date();
				callback(server.time);
			}
			else {
				server.offset = 3600000 * (((new Date()).getTimezoneOffset() / -60) - data.dstOffset);
				server.time = new Date(Date.now() - server.offset);
				callback(server.time);
			}
		});
	}
   
	function getPopTime(defaultValue) {
		return localStorage.getItem('LMN.nextPopTime') || defaultValue;
	}
   
	function setPopTime(hours, minutes) {
		if(typeof minutes !== 'number' || typeof hours !== 'number') {
			return false;
		}
		minutes = Math.abs(minutes%60);
		hours = Math.abs(hours%24);
		minutesBeforeMidnight = 1440 - hours*60 - minutes;
		localStorage.setItem('LMN.nextPopTime',  minutesBeforeMidnight);
		clearTimeout(currentTimeout);
		createNotifEvent();
		return true;
	}
   
	function getNextNotifDate() {
		var notifTime = new Date();
		notifTime.setDate(notifTime.getDate() + 1);
		notifTime.setHours(0, 0, 0, 0);
		var serverMidnight = new Date(notifTime.getTime() - server.offset);
		notifTime = new Date(notifTime.getTime() - minutesBeforeMidnight * 60000 - server.offset);
 
		// notifTime : Heure du prochain affichage de la notif. Heure serveur
		// server.time : heure actuelle du serveur
		// serverMidnight : Minuit, heure serveur
		if (notifTime.getTime() > server.time.getTime()) {
			return notifTime; // l'heure d'affichage de la notif est pas encore passée
		}
		else if(!alreadyShown && Date.now() < serverMidnight.getTime()) { // heure de la notif passée, mais minuit pas encore passé
			localStorage.setItem('LMN.alreadyShown', true);
			localStorage.setItem('LMN.alreadyShownDate', serverMidnight.getTime());
			alreadyShown = true;
			return new Date();
		}
		else { // minuit passé, ou notif déja affichée, on reporte l'affichage au lendemain
			notifTime.setDate(notifTime.getDate() + 1);
			return notifTime;
		}
	}
   
	function createNotifEvent() {
		updateServerTime(function(serverTime) {
			var tmp = getNextNotifDate();
			currentTimeout = setTimeout(function() {
				if(alreadyShown && serverTime.getTime() > alreadyShownDate) { // on a passé minuit, on reset le fait que la opp-in a déja popée
						localStorage.setItem('LMN.alreadyShown', false);
				}
				_.get('garden/get/$', function(data) {
					if(data.success) {
						if(data.garden.solo_fights + data.garden.farmer_fights + data.garden.team_fights > 0) {
							popNotif(text.message);
						}
					}
					else {
						popNotif(text.failMessage);
					}
				});
				setTimeout(createNotifEvent, 5000);
			}, Math.max(tmp.getTime() - server.time.getTime(), 0));
			window._LMN_next_pop = "[Last Minute Notifier] Le " + tmp.getDate() + ' à ' + tmp.getHours() + ':' + tmp.getMinutes();
		});
	}
   
	function popNotif(message) {
		pop.content.text(message);
		pop.drop.css('top', 0);
	}
 
	function hideNotif() {
		pop.drop.css('top', -pop.drop.outerHeight());
	}
   
	function getHMFromM(minutes) {
		return {
			'hours': Math.floor((1440 - minutes)/60),
			'minutes': (1440 - minutes)%60
		};
	}
 
	function initDropdown() {
		if(LW.farmer.id === undefined) {
			setTimeout(initDropdown, 1000);
			return;
		}
	   
		LW.on('pageload', function() {
			if(LW.currentPage === 'settings') {
				 $('#settings-page .flex-container')
				.first()
				.append('<div class="column6"><div class="panel"><div class="header"><h2>[Userscript] Last Minute Notifier</h2></div><div class="content"><h4 style="text-align: left">Veuillez entrer l\'heure d\'affichage de la notification</h4><br><h4>Heures</h4><input type="number" id="LMN_hours"><br/><h4 style="margin-top: 0.6em">Minutes</h4><input type="number" id="LMN_minutes"><br></br></br><center><input type="submit" class="button green" value="Appliquer" id="LMN_apply"></center></div></div></div>');
 
				$('#LMN_hours').val(getHMFromM(minutesBeforeMidnight).hours);
				$('#LMN_minutes').val(getHMFromM(minutesBeforeMidnight).minutes);
				$('#LMN_apply').click(function() {
					if(setPopTime(parseInt($('#LMN_hours').val()), parseInt($('#LMN_minutes').val()))) {
						_.toast('Heure de notification mise à jour');
					}
					else {
						_.toast('Heures non valide');
					}
					$('#LMN_hours').val(getHMFromM(minutesBeforeMidnight).hours);
					$('#LMN_minutes').val(getHMFromM(minutesBeforeMidnight).minutes);
				});
			}
		});
			   
		// création du dropdown
		pop.drop = $(document.createElement('div'))
				.css({width: '70%', position: 'fixed', left: '15%', top: '-1000px', 'background-image': 'url("https://leekwars.com/static/image/background.png")', 'z-index': 2000, 'transition': 'ease 0.6s top'})
				.appendTo(document.body);
		pop.title = $(document.createElement('div'))
				.text(text.name)
				.css({'text-align': 'center', height: '3em', 'line-height': '3em', 'font-size': '2em', color: 'white', background: 'hsla(0, 0%, 100%, 0.2)'})
				.appendTo(pop.drop);
		pop.content = $(document.createElement('div'))
				.css({padding: '1.5em', color: 'white', 'font-size': '1.5em', 'text-align': 'center'})
				.appendTo(pop.drop);
		pop.footer = $(document.createElement('div'))
				.appendTo(pop.drop);
		pop.cancel = $(document.createElement('button'))
				.text(text.ok)
				.css({width: '50%', background: '#555', padding: '0.6em', color: '#eee', 'text-align': 'center', border: 'none', 'font-size': '1.5em', cursor: 'pointer'})
				.click(hideNotif)
				.hover(function() {
					pop.cancel.css('background', '#777');
				}, function() {
					pop.cancel.css('background', '#555');
				})
				.appendTo(pop.footer);
		pop.toGarden = $(document.createElement('button'))
				.text(text.toGarden)
				.css({width: '50%', background: '#5FAD1B', padding: '0.6em', color: '#eee', 'text-align': 'center', border: 'none', 'font-size': '1.5em', cursor: 'pointer'})
				.click(function() {
					hideNotif();
					LW.page('/garden');
				})
				.hover(function() {
					pop.toGarden.css('background', '#73D120');
				}, function() {
					pop.toGarden.css('background', '#5FAD1B');
				})
				.appendTo(pop.footer);
 	
 		hideNotif();
		createNotifEvent(); // on initialise l'event
	}
	   
	initDropdown();
   
})();
