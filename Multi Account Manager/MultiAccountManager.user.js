// ==UserScript==
// @name		  [Leek Wars] Multi-account manager
// @namespace	 https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @version		0.4.2
// @description	Permet de passer facilement de comptes en comptes
// @author		Twilight
// @projectPage	https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @updateURL	 https://github.com/PerthuisQuentin/Leek-Wars-Scripts/raw/master/Multi%20Account%20Manager/MultiAccountManager.user.js
// @downloadURL	https://github.com/PerthuisQuentin/Leek-Wars-Scripts/raw/master/Multi%20Account%20Manager/MultiAccountManager.user.js
// @match		 *://*.leekwars.com/*
// @grant		 none
// ==/UserScript==

(function() {

	var currentAccounts = getAccounts(), dropdown;

	function getAccounts() {
		return (localStorage.getItem('MAM.accounts')) ? JSON.parse(localStorage.getItem('MAM.accounts')) : [];
	}

	function setAccounts(accounts) {
		localStorage.setItem('MAM.accounts', JSON.stringify(accounts));
	}

	function getCurrentPage() {
		return (LW.currentPage === 'signup' || LW.currentPage === 'login') ? '/' : document.location.toString().replace(/https?:\/\/leekwars\.com/, '');
	}

	function genDropDown() {
		if(LW.currentPage === undefined) {
			setTimeout(genDropDown, 150);
			return;
		}

		var list, i;

		if(dropdown && dropdown.remove) {
			dropdown.remove();
		}
		dropdown = undefined;

		var target = (LW.connected) ? $('#header-farmer div.button-wrapper:nth-child(6)') : $('#header-signin > div:nth-child(2)');

		dropdown = $(document.createElement('div')).css({
			position: 'absolute', border: 'solid 1px rgba(255, 255, 255, 0.4)', background: '#282828 url(https://leekwars.com/static/image/background.png)',
			'box-sizing': 'border-box', 'z-index': 9999, 'opacity': '0'
		}).appendTo(target);

		list = $(document.createElement('div')).css({
			display: 'flex', 'flex-direction': 'column', width: '100%', height: '100%', color: 'white', 'font-size': '1.2em', 'box-sizing': 'border-box'
		}).appendTo(dropdown);

		list.html('');

		for(i = 0; i < currentAccounts.length; ++i) {
			(function(i) {
				var current = $(document.createElement('div')).css({
					'box-sizing': 'border-box', cursor: 'pointer'
				}).hover(function() {
					$(this).css('background', '#5fad1b');
				}, function() {
					$(this).css('background', 'transparent');
				}).click(function() {
					var currentLocation = getCurrentPage();

					if(LW.connected) {
						LW.disconnect();
					}

					setTimeout(function() { // ptit délais pour laisser le temps de revenir à l'écran de connexion
						_.post('farmer/login', {login: currentAccounts[i].pseudo, password: currentAccounts[i].password}, function(data) {
							if(data.success) {
								LW.connect(data.farmer, function() {
									LW.page(currentLocation);
									document.location.reload();
									genDropDown();
									genOptionList();
								});
							}
						});
					}, 200); // Si votre connexion est lente, il peut s'avérer nécessaire d'augmenter ce nombre
				});

				$(document.createElement('div')).css({
					width: 'calc(1em + 25px)', height: 'calc(1em + 25px)', 'margin-top': '2px', 'margin-left': '2px',
					background: 'url(https://leekwars.com/static/image//avatar/' + currentAccounts[i].id + '.png)',
					'background-size': '100% 100%',
					display: 'inline-block', 'float': 'left'
				}).appendTo(current);

				$(document.createElement('div')).css({
					padding: '12px 20px', 'margin-left': 'calc(1em + 20px)'
				}).text(currentAccounts[i].pseudo).appendTo(current);

				current.appendTo(list);
			})(i);
		}

		dropdown.slideUp(0, function() {
			dropdown.css('opacity', '1');
		});

		target.hover(function() {
			dropdown.stop(true, false).slideDown();
		}, function() {
			dropdown.stop(true, false).slideUp();
		});

		dropdown.css('margin-left', -dropdown.outerWidth() + target.outerWidth() + 'px');
	}

	function genOptionList() {
		if(LW.currentPage !== 'settings') return;
		var manager = $('#MAM-list');
		manager.html('');

		for(var i = 0; i < currentAccounts.length; ++i) {
			(function(i) {
				var line = $(document.createElement('div')).css({
					width: '70%', 'border-bottom': 'solid 1px rgba(0, 0, 0, 0.1)', 'text-align': 'left', 'margin': '10px 0', 'margin-left': '15%'});

					$(document.createElement('div')).text(currentAccounts[i].pseudo).css({
					'font-size': '1.2em', 'display': 'inline-block'}).appendTo(line);

					$(document.createElement('div')).text('Supprimer').css({
					color: '#5fad1b', 'display': 'inline-block', 'float': 'right', 'cursor': 'pointer'}).attr('data-id', currentAccounts[i].id).click(function() {
						for(var j = 0; j < currentAccounts.length; ++j) {
							if(currentAccounts[j].id === parseInt($(this).attr('data-id'))) {
								currentAccounts.splice(j, 1);
								break;
							}
						}

						setAccounts(currentAccounts);
						genDropDown();
						genOptionList();
					}).appendTo(line);

					$(document.createElement('div')).text('Modifier').css({
						color: '#5fad1b', 'display': 'inline-block', 'float': 'right', 'margin-right': '10px', 'cursor': 'pointer' }).attr('data-id', currentAccounts[i].id)
						.click(function() {
							var current = -1;
							for(var j = 0; j < currentAccounts.length; ++j) {
								if(currentAccounts[j].id === parseInt($(this).attr('data-id'))) {
									current = j;
									break;
								}
							}
							if(current === -1) return;

							getAccount('Modifier un compte', function(data) {
								currentAccounts[current] = {pseudo: data.pseudo, password: data.password, id: data.id};
								setAccounts(currentAccounts);
								genDropDown();
								genOptionList();
							}, {
								pseudo: currentAccounts[current].pseudo,
								password: currentAccounts[current].password
							});


						}).appendTo(line);

					line.appendTo(manager);
				})(i);
			}
	}

	function getAccount(title, callback, data) {
		var popin = $(document.createElement('div')).css({
			width: '60%', position: 'fixed', left: '20%', top: '100px', background: '#282828 url(https://leekwars.com/static/image/background.png)', 'z-index': '3000'
		});

		var blackground = $(document.createElement('div')).css({
			'backdrop-filter': 'blur(10px)', // css filter 2. Si vous utilisez pas les nightlies de webkit, faudra attendre un peu pour voir la magnificience du bordel
			background: 'rgba(0, 0, 0, 0.7)', position: 'fixed', top: '0', bottom: '0', left: '0', right: '0', 'z-index': '2999'
		}).appendTo(document.body);

		var title = $(document.createElement('div'))
					.text(title)
					.css({'text-align': 'center', height: '3em', 'line-height': '3em', 'font-size': '2em', color: 'white', background: 'hsla(0, 0%, 100%, 0.2)'})
					.appendTo(popin);

		var content = $(document.createElement('div'))
					.css({padding: '1.5em', color: 'white', 'font-size': '1.5em', 'text-align': 'center'})
					.appendTo(popin);
		var footer = $(document.createElement('div'))
					.appendTo(popin);
		var cancel = $(document.createElement('button'))
					.text('Annuler')
					.css({width: '50%', background: '#555', padding: '0.6em', color: '#eee', 'text-align': 'center', border: 'none', 'font-size': '1.5em', cursor: 'pointer'})
					.click(function() {
						blackground.remove();
						popin.remove();
					})
					.hover(function() {
						$(this).css('background', '#777');
					}, function() {
						$(this).css('background', '#555');
					})
					.appendTo(footer);

		var inputPseudo = $(document.createElement('input')).attr('placeholder', 'Pseudo').attr('type', 'text').appendTo(content);
		var inputPassword = $(document.createElement('input')).attr('placeholder', 'Mot de passe').attr('type', 'password').appendTo(content);

    function submitf() {
      if(inputPassword.val().trim() !== '' && inputPseudo.val().trim() !== '') {
        // on récupère l'id de ce compte
        _.post('farmer/login', {login: inputPseudo.val(), password: inputPassword.val()}, function(data) {
          if(data.success) {
            callback({
              pseudo: inputPseudo.val(),
              password: inputPassword.val(),
              id: data.farmer.id
            });
          }
          else {
            setTimeout(function() {
              _.toast('Utilisateur inexistant');
            }, 200);
          }
          blackground.remove();
          popin.remove();
        });
      }
    }

    $(inputPseudo).add(inputPassword).on('keydown', function(e) {
      if(e.which === 13) {
        submitf();
      }
    });

		var submit = $(document.createElement('button'))
					.text('Valider')
					.css({width: '50%', background: '#5FAD1B', padding: '0.6em', color: '#eee', 'text-align': 'center', border: 'none', 'font-size': '1.5em', cursor: 'pointer'})
					.click(submitf)
					.hover(function() {
						$(this).css('background', '#73D120');
					}, function() {
						$(this).css('background', '#5FAD1B');
					}).appendTo(footer);


		$([inputPseudo[0], inputPassword[0]]).css({
			margin: '0 10px',
			padding: '0.2em',
			'font-size': '1.1em',
			background: 'rgba(255, 255, 255, 0.7)'
		});

		if(data) {
			if(data.pseudo) inputPseudo.val(data.pseudo);
			if(data.password) inputPassword.val(data.password);
		}

		popin.appendTo(document.body);
	}

	LW.on('pageload', function() {
		if(LW.currentPage === 'settings') {
			$('#settings-page .flex-container')
			.first()
			.append('<div class="column6"><div class="panel"><div class="header"><h2>[Userscript] Multi Account Manager</h2></div><div class="content"><br><center><input type="submit" class="button green" value="Gérer les comptes" id="MAM-manage"></center><br><div id="MAM-accounts"><h4>Liste des comptes</h4><div id="MAM-list"></div><br></div><br/></div></div>');

			$('#MAM-accounts').stop(true, false).slideUp(0);
			var manager = $('#MAM-list');

			var opened = false;
 			$('#MAM-manage').click(function() {
 				if(opened) $('#MAM-accounts').stop(true, false).slideUp();
 				else $('#MAM-accounts').stop(true, false).slideDown();
 				opened = !opened;
 			});

			genOptionList();

			$(document.createElement('div')).text('Ajouter un compte').css({
				color: '#5fad1b', cursor: 'pointer'
			}).click(function() {
				getAccount('Ajouter un compte', function(data) {
					currentAccounts.push(data);
					setAccounts(currentAccounts);
					genDropDown();
					genOptionList();
				});
			}).appendTo($('#MAM-accounts'));
		}
	});

	LW.on('pageload', genDropDown);
})();
