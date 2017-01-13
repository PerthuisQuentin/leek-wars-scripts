// ==UserScript==
// @name           [Leek Wars] Editor-fight - new tab
// @namespace      https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @version        0.3.1
// @description    Lance les tests dans un nouvel onglet
// @author         Twilight
// @projectPage    https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @updateURL      https://github.com/PerthuisQuentin/Leek-Wars-Scripts/raw/master/EditorFightNewTab/editor-fight-new-tab.user.js
// @downloadURL    https://github.com/PerthuisQuentin/Leek-Wars-Scripts/raw/master/EditorFightNewTab/editor-fight-new-tab.user.js
// @match          *://*.leekwars.com/*
// @grant          none
// ==/UserScript==

(function() {
	var loaded = false; // the editor page has already been loaded

	function init() {
		if(LW.currentPage == undefined) {
			setTimeout(init, 200);
			return;
		}

		if(!localStorage.getItem('EFNT-showreport')) {
			localStorage.setItem('EFNT-showreport', false);
		}

		LW.on('pageload', function() {
			if(LW.currentPage == 'editor') {
				setTimeout(replace, 200);
				return;
			}

			if(LW.currentPage === 'settings') {
				$('#settings-page .flex-container')
				.first()
				.append('<div class="column6"><div class="panel"><div class="header"><h2>[Userscript] Editor Fight New Tab</h2></div><div class="content"><input type="checkbox" ' + 
					(localStorage.getItem('EFNT-showreport') === 'true' ? 'checked="true"' : '') + ' id="EFNT-report"><label for="EFNT-report"> Afficher directement le rapport ?</label></div></div></div>');
 				
 				document.querySelector('#EFNT-report').addEventListener('change', function() {
 					localStorage.setItem('EFNT-showreport', this.checked);
 				});
			}
		});
	}

	function replace() {
		// only generated if a test is launched, just wait for it to be opened
		var old = document.querySelector('#launch');
		if(old == null) {
			setTimeout(replace, 100);
			return;
		}
		else if(loaded) {
			old.id = ''; // prevent the modification of the old element and wait for the new one to be created
			setTimeout(replace, 100);
			loaded = false;
			return;
		}
		var clone = old.cloneNode(true);
		old.parentNode.replaceChild(clone, old);
		loaded = true;
		var center = document.querySelector('.test_popup .content center');
		center.innerHTML += '<label style="margin-left: 20px;"><input type="checkbox" ' + (localStorage.getItem('EFNT-showreport') === 'true' ? 'checked="true"' : '') + ' id="EFNT-report2"> Afficher rapport</label>';
		document.querySelector('#EFNT-report2').addEventListener('change', function() {
 			localStorage.setItem('EFNT-showreport', this.checked);
 		});

		// application de notre event perso
		clone.addEventListener('click', function() {
			var data = {};
			var select = center.querySelector('#test-ais');
			data.ai_id = select.options[select.selectedIndex].id;
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
					link.setAttribute('href', (localStorage.getItem('EFNT-showreport') === 'true' ? 'https://leekwars.com/report/' : 'https://leekwars.com/fight/') + data.fight);
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
