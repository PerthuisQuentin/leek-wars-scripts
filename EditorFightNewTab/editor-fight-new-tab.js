// ==UserScript==
// @name              [Leek Wars] Editor-fight - new tab
// @namespace         https://github.com/Ebatsin/Leek-Wars/
// @version           0.1
// @description       Lance les tests dans un nouvel onglet
// @author            Twilight
// @projectPage       https://github.com/Ebatsin/Leek-Wars/
// @match             http://leekwars.com/*
// @grant             none
// ==/UserScript==

(function() {
	function init() {
		if(LW.currentPage == undefined) {
			setTimeout(init, 200);
			return;
		}
		LW.on('pageload', function() {
			if(LW.currentPage == 'editor') {
				replace();
				
			}
		});
	}

	function replace() {
		// only generated if a test is launched, just wait for it to be opened
		var old = document.querySelector('#launch');
		if(old == null) {
			setTimeout(replace, 400);
			return;
		}
		var clone = old.cloneNode(true);
		old.parentNode.replaceChild(clone, old);

		// application de notre event perso
		clone.addEventListener('click', function() {
			var data = {};
			data.ai_id = _testAI;
			data.leek_id = _testLeek;

			data.bots = {};
			for (var i in _testEnemies) {
				data.bots[i] = _testEnemies[i];
			}

			data.type = _testType;
			_.post('ai/test', data, function(data) {
				if (data.success) {
					_testPopup.dismiss();
					// create dummy link
					var link = document.createElement('a');
					link.setAttribute('href', 'http://leekwars.com/fight/' + data.fight);
					link.setAttribute('target', '_blank');
					link.style.position = "absolute";
					link.style.left = "-1000px";
					document.body.appendChild(link);
					link.click();
				}
				else {
					_.toast("Erreur : " + data.error);
				}
			});
		});
	}

	init();
})();
