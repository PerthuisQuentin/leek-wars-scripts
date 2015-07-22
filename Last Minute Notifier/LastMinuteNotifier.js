// ==UserScript==
// @name          [Leek Wars] Last Minute Notifier
// @version       1.0
// @description   Permet d'être averti quelques temps avant minuit si il reste des combats
// @author        Twilight
// @match         http://leekwars.com/*
// @grant         none
// ==/UserScript==

(function() {
	var LMN_MINUTES_BEFORE_MIDNIGHT = 20; // nombre de minutes avant minuit avant lesquelles la notif apparaîtra

	var LMN_name = "Last Minute Notifier",
		LMN_message = "Il est tard et il te reste des combats, pense à aller les faire !",
		LMN_fail = "Suite à une erreur, il n'y aura pas d'annonce de fin de journée pour vos combats",
		LMN_OKMsg = "OK", // toi aussi crée des variables utiles
		LMN_toGardenMsg = "Aller au potager",
		LMN_drop, LMN_content, LMN_footer, LMN_cancel, LMN_toGarden;

	/*
	*	Cette fonction sert à rien pour le moment. Il faudrait qu'elle renvoit l'heure française (donc UTC+1 et en prenant en compte l'heure d'été).
	*	Si vous avez des idées sur comment faire ça (sans passer par timezone-js qui est un peu overkill)
	*/
	var LMN_getUTC = function() {
		var LMN_utc = new Date();
		LMN_utc = new Date(Date.UTC(LMN_utc.getFullYear(), LMN_utc.getMonth(), LMN_utc.getDate(), LMN_utc.getHours(), LMN_utc.getMinutes(), LMN_utc.getSeconds()));
		return new Date(LMN_utc.getTime() + LMN_utc.getTimezoneOffset() * 60000); // on se met à l'heure serveur (UTC+1)
	};

	var LMN_getNextNotifDate = function() {
		var LMN_utc = LMN_getUTC();

		var LMN_todayTime = new Date(LMN_utc.getTime());
		LMN_todayTime.setDate(LMN_utc.getDate() + 1);
		LMN_todayTime.setHours(0, 0, 0, 0);
		LMN_todayTime = new Date(LMN_todayTime.getTime() - LMN_MINUTES_BEFORE_MIDNIGHT * 60000);

		if (LMN_todayTime.getTime() > LMN_utc.getTime()) {
			return LMN_todayTime;
		} 
		else {
			LMN_todayTime.setDate(LMN_todayTime.getDate() + 1);
			return LMN_todayTime;
		}
	};

	var LMN_createNotifEvent = function() {
		setTimeout(function () {
			_.get('garden/get/$', function (data) {
				if (data.success) {
					if (data.garden.solo_fights + data.garden.farmer_fights + data.garden.team_fights > 0) {
						LMN_popNotif(LMN_message);
					}
				}
				else {
					LMN_popNotif(LMN_fail);
				}
			});
			setTimeout(LMN_createNotifEvent, 5000); // juste par sécu, pour pas trigger le truc 2 fois
		}, LMN_getNextNotifDate().getTime() - LMN_getUTC().getTime());
		var LMN_tmp = LMN_getNextNotifDate();
		window._LMN_next_pop = "[Last Minute Notifier] Le " + LMN_tmp.getDate() + ' à ' + LMN_tmp.getHours() + ':' + LMN_tmp.getMinutes();
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
	
	LMN_initDropdown();
})();
