// ==UserScript==
// @name        [Leek Wars] Battle Royale Register
// @namespace   https://github.com/Ebatsin/Leek-Wars/
// @description Permet l'inscription automatique aux battle royales
// @author        Ebatsin
// @projectPage   https://github.com/Ebatsin/Leek-Wars/
// @downloadURL   https://github.com/Ebatsin/Leek-Wars/raw/master/Battle%20Royale%20Register/battleroyaleregister.user.js
// @updateURL     https://github.com/Ebatsin/Leek-Wars/raw/master/Battle%20Royale%20Register/battleroyaleregister.user.js
// @match     *://*.leekwars.com/*
// @version     0.4
// @grant       none
// ==/UserScript==

(function() {
	var cssCode = '\
		@keyframes BRR-loadAppear {\
			0% {\
				opacity: 0;\
				margin-top: 0;\
			}\
			100% {\
				opacity: 100%;\
				margin-top: calc(-12px - 1em);\
			}\
		}\
		@keyframes BRR-tooltipAppear {\
			0% {\
				opacity: 0;\
				transform: scale(0.2);\
			}\
			100% {\
				opacity: 100%;\
				transform: scale(1);\
			}\
		}\
		.BRR-tooltip {\
			transition: ease 0.4s left;\
			display: flex;\
			position: fixed;\
			left: 0;\
			top: 0;\
			background: hsl(0, 0%, 95%);\
			padding: 0.5em;\
			box-shadow: 0 0 10px hsla(0, 0%, 0%, 0.34);\
			z-index: 10;\
			animation: BRR-tooltipAppear ease 0.2s;\
			transform-origin: left;\
		}\
		.BRR-tooltip.hide {\
			display: none;\
		}\
		.BRR-tooltip > div {\
			transition: ease 0.2s;\
			transition-property: opacity, box-shadow;\
			background: white;\
			margin: 0.6em;\
			box-shadow: 0 0 3px hsla(0,0%,0%,0.16), 0 0 3px hsla(0,0%,0%,0.23);\
			padding: 0.7em;\
		}\
		.BRR-tooltip > div.inactive {\
			opacity: 0.3;\
			box-shadow: none;\
		}\
		.BRR-tooltip > div > div:first-of-type {\
			margin-bottom: 0.7em;\
		}\
		.BRR-tooltip > div > div:first-of-type div:first-of-type {\
			display: inline-block;\
			font-size: 1.3em;\
			margin-right: 0.4em;\
		}\
		.BRR-tooltip > div > div:first-of-type div:last-of-type {\
			color: gray;\
			float: right;\
		}\
		.BRR-tooltip > div > div:nth-child(2) {\
			display: flex;\
		}\
		.BRR-tooltip > div > div:nth-child(2) div:first-of-type {\
			display: inline-block;\
			padding: 0.7em;\
			cursor: pointer;\
		}\
		.BRR-tooltip .BRR-battleList {\
			box-sizing: border-box;\
			list-style-type: none;\
			padding: 0;\
			display: inline-block;\
			float: right;\
		}\
		.BRR-tooltip .BRR-battleList li {\
			transition: ease 0.2s box-shadow;\
			border: solid 1px hsl(0, 0%, 70%);\
			padding: 0.2em 0.7em;\
			margin: 0.3em;\
			font-size: 0.8em;\
			color: hsl(0, 0%, 11%);\
			cursor: pointer;\
		}\
		.BRR-tooltip .BRR-battleList li:hover {\
			box-shadow: 0 0 5px hsla(0, 0%, 0%, 0.16);\
		}\
		.BRR-tooltip > div > div:last-of-type {\
			height: 7px;\
			background-color: hsl(0, 0%, 95%);\
			border: solid 1px hsl(0, 0%, 70%);\
		}\
		.BRR-tooltip > div > div:last-of-type:hover .BRR-loadtooltip {\
			display: inline-block;\
			animation: BRR-loadAppear ease 0.3s;\
		}\
		.BRR-loadedPart {\
			transition: ease 0.3s width;\
			height: 100%;\
			width: 0%;\
			background: hsl(0, 0%, 70%);\
		}\
		.BRR-loadtooltip {\
			background-color: hsl(0, 0%, 95%);\
			box-shadow: 0 0 10px hsla(0, 0%, 0%, 0.34);\
			transform: translateY(-100%);\
			margin-top: calc(-12px - 1em);\
			display: none;\
			position: absolute;\
			padding-bottom: 2em;\
		}\
		.BRR-tooltip > div.inactive .BRR-loadtooltip {\
			display: none !important;\
		}\
		.BRR-loadtooltip:before {\
			width: 20px;\
			height: 20px;\
			background-color: hsl(0, 0%, 95%);\
			content: " ";\
			display: block;\
			margin-left: calc(50% - 10px);\
			transform: rotate(-135deg);\
			bottom: -12px;\
			position: absolute;\
			box-shadow: 10px 10px 0px 0px hsl(0, 0%, 95%), 0 10px 0px 0px hsl(0, 0%, 95%), 10px 0px 0px 0px hsl(0, 0%, 95%), 0 0 10px hsla(0, 0%, 0%, 0.24);\
		}\
		.BRR-leeksList {\
			margin: 2em;\
			padding: 0;\
			list-style-type: none;\
			color: hsl(0, 0%, 11%);\
			text-align: center;\
		}\
		.BRR-leeksList li {\
			margin-top: 0.7em;\
		}\
		.BRR-circle {\
			width: 4em;\
			height: 4em;\
			border: solid 2px hsl(0, 0%, 80%);\
			border-radius: 50%;\
			display: flex;\
			align-items: center;\
			justify-content: center;\
			margin-left: calc(50% - 2em);\
			font-size: 1.4em;\
		}\
	';

	var style = $(document.createElement('style')).attr('type', 'text/css').html(cssCode);
	document.head.appendChild(style[0]);

	var icon;
	var leeks = {};
	var currentLeek = 0;

	function getLocalStorage() {
		if(!localStorage.getItem('BRR_' + LW.farmer.id)) {
			localStorage.setItem('BRR_' + LW.farmer.id, JSON.stringify({
				'current': 0
			}));
		}

		return JSON.parse(localStorage.getItem('BRR_' + LW.farmer.id));
	}

	function setLocalStorage(value) {
		localStorage.setItem('BRR_' + LW.farmer.id, JSON.stringify(value));
	}

	// find a way for this function not to be called each time the mouse move on the tooltip
	function setPosition(element) {
		var pos = icon.getBoundingClientRect();
		element.style.left = Math.round(pos.left + pos.width) + 'px';
		element.style.top = Math.round(pos.top - (element.offsetHeight/2) + (icon.offsetHeight/2)) + 'px';
	}

	function genBrLinks(elem, array) {
		elem.innerHTML = '';
		for(var i = 0; i < array.length; ++i) {
			var li = document.createElement('li');
			var a = document.createElement('a');
			a.innerHTML = array[i].date;
			a.href = '/fight/' + array[i].id;
			li.appendChild(a);
			elem.appendChild(li);
		}
	}

	function genLeeksList(data, ul, amount) {
		ul.innerHTML = '';
		amount.innerHTML = '';
		amount.innerHTML = ('0' + data[0]).slice(-2) + '/10';

		for(var i in data[1]) {
			var leek = data[1][i];
			var li = document.createElement('li');
			li.innerHTML = leek.name + ' (' + leek.talent + ')';
			ul.appendChild(li);
		}
	}

	function init() {
		if(!LW || !LW.currentPage || !LW.socket || !LW.socket.socket) {
			setTimeout(init, 100);
			return;
		}

		if(icon) { return;}

		LW.socket.socket.BRRBackupMessage = LW.socket.socket.onmessage;
		LW.socket.socket.onmessage = function(msg) {
			if(leeks[currentLeek] && leeks[currentLeek].onmessage(msg)) return;
			LW.socket.socket.BRRBackupMessage(msg);
		};

		icon = document.querySelector('#menu a[href="/garden"]');

		var tooltip = document.createElement('div');
		tooltip.classList.add('BRR-tooltip');
		tooltip.classList.add('hide');

		icon.addEventListener('mouseover', function() {
			tooltip.classList.remove('hide');
			setPosition(tooltip);
		});

		icon.addEventListener('mouseout', function() {
			tooltip.classList.add('hide');
		});

		tooltip.addEventListener('mouseover', function() {
			tooltip.classList.remove('hide');
			setPosition(tooltip);
		});

		tooltip.addEventListener('mouseout', function() {
			tooltip.classList.add('hide');
		});

		for(var i in LW.farmer.leeks) {
			var leek = LW.farmer.leeks[i];
			leeks[leek.id] = {
				active: false,
				onmessage: function(){},
			};

			if(leek.level < 50) continue;

			if(!getLocalStorage()[leek.id]) {
				var tmp = getLocalStorage();
				tmp[leek.id] = [];
				setLocalStorage(tmp);
			}

			var card = document.createElement('div');
			var titleBar = document.createElement('div');
			var leekName = document.createElement('div');
			var leekRange = document.createElement('div');
			var middleContener = document.createElement('div');
			var leekPic = document.createElement('div');
			var battleList = document.createElement('ul');
			var loadingBar = document.createElement('div');
			var loadedPart = document.createElement('div');

			// loadbar tooltip
			var loadTooltip = document.createElement('div');
			var leeksList = document.createElement('ul');
			var circle = document.createElement('div');
			var numberOfLeeks = document.createElement('span');

			card.classList.add('inactive');
			loadedPart.classList.add('BRR-loadedPart');
			battleList.classList.add('BRR-battleList');

			loadTooltip.classList.add('BRR-loadtooltip');
			leeksList.classList.add('BRR-leeksList');
			circle.classList.add('BRR-circle');

			leekName.innerHTML = leek.name;
			// possible ranges : 50-99, 100-199, 200-299, 300-301
			leekRange.innerHTML = (leek.level < 100 ? '[50 - 99]' : (leek.level < 200 ? 
				'[100 - 199]' : (leek.level < 300 ? '[200 - 299]' : '[300 - 301]')));

			LW.createLeekImage(0.5, leek.level, leek.skin, leek.hat, function(data) {
				leekPic.innerHTML = data;
			});
			
			genBrLinks(battleList, getLocalStorage()[leek.id]);

			(function(card, leek, loadedPart, battleList, leeksList, numberOfLeeks) {
				leekPic.addEventListener('click', function() {
					if(card.classList.contains('inactive')) {
						// disable all the others before we start this one
						var others = document.querySelectorAll('.BRR-tooltip > div');
						for(var i = 0; i < others.length; ++i) {
							others[i].classList.add('inactive');
							others[i].querySelector('.BRR-loadedPart').style.width = '0%';
							others[i].querySelector('.BRR-loadedPart').style.color = 'red';
						}
						currentLeek = leek.id;
						(function() {
							var tmp = getLocalStorage();
							tmp.current = currentLeek; // save the current leek in case of refresh
							setLocalStorage(tmp);
						})();
					}
					else {
						LW.socket.send([BATTLE_ROYALE_LEAVE]);
						currentLeek = 0;
						(function() {
							var tmp = getLocalStorage();
							tmp.current = currentLeek; // save the current leek in case of refresh
							setLocalStorage(tmp);
						})();
						loadedPart.style.width = '0%';
					}
					card.classList.toggle('inactive');
					leeks[leek.id].active = !card.classList.contains('inactive');

					if(leeks[leek.id].active) {
						LW.socket.send([BATTLE_ROYALE_REGISTER, leek.id]);
						leeks[leek.id].onmessage = function(msg) {
							var data = JSON.parse(msg.data);
							var id = data[0];
							data = data[1];

							switch(id) {
								case BATTLE_ROYALE_UPDATE:
									console.log("BR -> ", data);
									loadedPart.style.width = parseInt(data[0])*10 + '%';
									genLeeksList(data, leeksList, numberOfLeeks);
									return LW.currentPage != 'garden';
								case BATTLE_ROYALE_START:
									loadedPart.style.width = '0%';
									card.classList.add('inactive');
									//sauvegarde de la BR
									var tmp = getLocalStorage();
									var now = new Date();
									tmp[leek.id].unshift({
										'date': 'Le ' + ('0' + now.getDate()).slice(-2) + '/' + 
											('0' + (now.getMonth() + 1)).slice(-2) + ' à ' + 
											('0' + now.getHours()).slice(-2) + 'h' + 
										 	('0' + now.getMinutes()).slice(-2),
										'id': data[0]
									});
									tmp[leek.id].splice(5); // keep only the last 5 BR
									tmp.current = 0; // disable the leek
									leeks[leek.id].active = false;
									setLocalStorage(tmp);

									genBrLinks(battleList, tmp[leek.id]);

									var notification = {
										type: 4,
										link: '/fight/' + data[0],
										image: 'team_fight',
										title: [leek.name, 'une BR'],
										message: [],
										date: Math.round((new Date()).getTime()/1000)
									};
									notification.formatted_date = LW.util.formatDuration(notification.date);

									LW.notifications.add(notification, true);

									return LW.currentPage != 'garden';
							}

							return false;
						};

					}
				});
			})(card, leek, loadedPart, battleList, leeksList, numberOfLeeks);

			circle.appendChild(numberOfLeeks);
			loadTooltip.appendChild(leeksList);
			loadTooltip.appendChild(circle);

			titleBar.appendChild(leekName);
			titleBar.appendChild(leekRange);
			middleContener.appendChild(leekPic);
			middleContener.appendChild(battleList);
			loadingBar.appendChild(loadedPart);
			loadingBar.appendChild(loadTooltip);
			card.appendChild(titleBar);
			card.appendChild(middleContener);
			card.appendChild(loadingBar);
			tooltip.appendChild(card);

			if(getLocalStorage().current == leek.id) leekPic.click();
		}

		document.body.appendChild(tooltip);

		setPosition(tooltip);

		window.addEventListener('resize', function() {
			setPosition(tooltip);
		});
	}

	LW.on('pageload', init);
})();
