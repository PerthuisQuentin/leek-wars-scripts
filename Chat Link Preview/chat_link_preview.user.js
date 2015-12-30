// ==UserScript==
// @name          [Leek Wars] Chat link preview
// @namespace     https://github.com/Ebatsin/Leek-Wars/
// @version       0.35
// @description   Permet d'afficher une preview des ressources linkées dans le chat
// @author        Twilight
// @projectPage   https://github.com/Ebatsin/Leek-Wars/
// @downloadURL   https://github.com/Ebatsin/Leek-Wars/raw/master/Chat%20Link%20Preview/chat_link_preview.user.js
// @updateURL     https://github.com/Ebatsin/Leek-Wars/raw/master/Chat%20Link%20Preview/chat_link_preview.user.js
// @match         http://leekwars.com/*
// @grant         GM_xmlhttpRequest
// @grant         GM_addStyle
// @require       http://code.jquery.com/jquery-2.1.4.min.js
// ==/UserScript==

/*
*	Attention ! Ce script est en version beta, il manque encore des fonctionnalités importantes
*	Il peut rester des bugs, des liens pas supportés mais qui devraient l'être.
*/

/*
*	Liens supportés :
*	- Pastebin
*	- Imgur (sauf les gifs de imgur et autres vidéos html5)
*	- Prntscr
*	- liens linkant directement vers une image au format: png, jpg, gif, bmp, svg
*	- youtube
*	- vimeo
*
*	Liens dont le support est prévu :
*	- lien directs vers des vidéos html5
*	- Imgur - gifv
*	- Soundcloud
*/

/*
*	Fonctionnement du script et ajouts de sites (faire une pull request pour ajouter le support d'un site)
*	Pour des raisons de sécurité, ne pas utiliser de clés d'API. Le code du userscript est public.
*
*	Le userscript fonctionne de manière modulaire afin de pouvoir ajouter de manière (relativement)
*	simple un site web ou une ressource.
*
*	Lorsqu'un lien est detecté dans le chat de leekwars, :
*	1) il est récupéré.
*	2) les matchers sont parcourus DANS l'ORDRE, l'url trouvée dans le chat est passée
*		aux fonctions 'match' de chaque élément de matchers. Le premier qui retourne true
*		confirme sa capacité à gérer cette url.
*	3) Cette url est ensuite donnée à la fonction 'request' du même élément de matchers.
*		Il peut retourner plusieurs valeurs:
*		i) Si le lien n'est pas valide, il peut retourner un objet contenant un seul champ
*			abort : {
*				'show': <afficher l'unfurl, malgré l'abort (true | false)>
*				'title': <le titre à afficher pour l'unfurl>
*				'description': <la description à afficher pour l'unfurl (pas encore supporté)>
*			}
*		ii) Si le lien envoie directement vers la ressource et qu'elle ne nécessite pas de $
*			pré-traitement (une image par exemple), un objet est retourné :
*			{
*				'displayMethod': <la displayMethod à utiliser>
*				'data': <un objet contenant les informations à destination de la displayMethod>
*			}
*			ce que sont les displayMethod sera vu plus loin
*		iii) Si le lien envoie directement vers la ressource mais qu'elle nécessite du
*			pré-traitement, un objet est retourné :
*			{
*				'handler': <le handler à qui passer l'url récupérée>
*				'url': <l'url à passer au handler>
*				'loadURL': false // indique que c'est l'url qui est passée et non ce qu'elle référence
*			}
*		iv) Si le lien envoie vers une ressource qui doit être chargée (par exemple, une
*			page web contenant l'info recherchée), un objet doit être retourné :
*			{
*				'handler': <le handler à qui passer ce que référence l'url récupérée>
*				'url': <l'url de ce qui doit être chargé (le résultat text du xmlhttprequest
*						sera donné au handler)>
*			}
*	4) Si un handler a été appelé à l'étape précedente, il peut recevoir soit une url, soit
*		la réponse text de XMLHttpRequest. Il peut alors effectuer un traitement sur ce qui lui
*		est passé. Il peut retourner les même objets que la fonction request (y comprit un abort)
*		Il peut également retourne un nouveau type d'objet :
*		{
*			'request': <le nom de l'élément de l'objet matchers duquel on veut appeler la fonction
*							request.>
*			'url': <l'url à passer à la fonction request. Elle sera automatiquement vérifiée par
*					la fonction match du même élément. Si match renvoie false, le traitement du lien
*					est annulé>
*		}
*	5) Si une displayMethod a été appelée à l'une des étapes précédentes, il doit recevoir un objet
*		data contenant les informations nécessaires (souvent au moins 'title').
*		Il doit retourner un objet contenant 2 champs obligatoires et 2 champs optionnel :
*		{
*			'title': <le titre à afficher, c'est ce que l'utilisateur devra cliquer pour ouvrir l'unfurl>
*			'elem': <un élément jQuery contenant l'intégralité de ce qui sera affiché sous l'unfurl
*						il sera copié tel quel, il doit donc tout contenir>
*			'description': optionnel <la description à afficher sous l'unfurl. Non supporté>
*			'post': optionnel <le nom de la fonction post à appeler après l'ajout au DOM de elem>
*		}
*	6) Si un post a été demandé par une displayMethod, il sera appelé avec en seul paramètre
*		l'élément qui vient d'être ajouté au DOM (celui généré par la displayMethod)
*/

function getMaxMediaHeight() {
	return 300;
}

(function() {
	var matchers = {
		'pastebin': {
			'match': function(url) {
				var reg = /(?:https?:\/\/)?pastebin\.com\/(?:raw\/)?[a-zA-Z\d]+/;
				return reg.test(url);
			},
			'request': function(url) {
				var regId = /\.com(?:\/raw)?\/([\da-zA-Z]+)$/;
				var id = regId.exec(url)[1];

				return {
					'url': 'https://pastebin.com/' + id,
					'handler': 'pastebin'
				};
			}
		},
		'prntscr': {
			'match': function(url) {
				var reg = /https?:\/\/prntscr\.com\/[a-z\d]+$/;
				return reg.test(url);
			},
			'request': function(url) {
				return {
					'url': url,
					'handler': 'prntscr'
				};
			}
		},
		'imgur': {
			'match': function(url) {
				var reg = /https?:\/\/(?:i\.|m\.)?imgur\.com\/(?:gallery\/|a\/)?[A-Za-z\d]+(?:\.[a-z]{3,4}(?:\?\d+)?|\/layout\/grid)?\/?/;
				return reg.test(url);
			},
			'request': function(url) {
				// si c'est une image, on récupère l'image directement.
				// si c'est une gallerie, on passe par la vue en grille pour avoir toutes les images de la gallerie
				var regId = /\.com\/(?:gallery\/|a\/)?([^\.\/\n]+)/;
				var regGallery = /\.com\/(gallery|a)\//;

				var id = regId.exec(url)[1];
				var isGallery = regGallery.exec(url) !== null;

				return {
					'url': (isGallery) ? 'https://imgur.com/a/' + id + '/layout/grid' : 'https://imgur.com/' + id,
					'handler': 'imgur'
				};
			}
		},
		'youtube': { // supporte oembed
			'match': function(url) {
				var reg = /https?:\/\/(?:m\.|www\.)?youtu(?:be\.com|\.be)\/(?:watch)?(?:\?v=)?[a-zA-Z\d]+(?:&[a-zA-Z\d]+=[a-zA-Z\d]+)*/;
				return reg.test(url);
			},
			'request': function(url) {
				return {
					'handler': 'youtube',
					'url': 'https://www.youtube.com/oembed?url=' + url + '&format=json'
				};
			}
		},
		'vimeo': { // supporte oembed
			'match': function(url) {
				var reg = /https?:\/\/vimeo\.com\/(?:channels\/[^\/]+\/|groups\/[^\/]+\/videos\/)?\d+/;
				return reg.test(url);
			},
			'request': function(url) {
				return {
					'handler': 'vimeo',
					'url': 'https://vimeo.com/api/oembed.json?url=' + url
				};
			}
		},
		'soundcloud': { // supporte oembed
			'match': function(url) {
				var reg = /https?:\/\/soundcloud\.com\/[a-zA-Z\d\-]+\/[a-zA-Z\d\-]+\/?/;
				return reg.test(url);
			},
			'request': function(url) {
				return {
					'handler': 'soundcloud',
					'url': 'https://soundcloud.com/oembed?url=' + url + '&format=json'
				};
			}
		},
		'basic-image': {
			'match': function(url) {
				var reg = /.*\.(?:png|jpe?g|gif|bmp|svg)(?:\/|\?.*|#.*)*$/i;
				return reg.test(url);
			},
			'request': function(url) {
				return {
					'displayMethod': 'basic-image',
					'data': {
						'title': 'Image',
						'url': url
					}
				};
			}
		}
	};

	var handlers = {
		'pastebin': function(data) {
			if((/id="content_left">[^<]*<[^>]*>([^<]*)/).exec(data)[1].trim().length !== 0) {
				return {
					abort: {
						'title': 'Ce paste n\'existe plus',
						'show': true
					}
				};
			}

			return {
				'displayMethod': 'pastebin',
				'data': {
					'language': (/h_640"><a href=".*margin:0">([^<]*)/).exec(data)[1],
					'title': (/class="paste_box_line1" title="([^"]*)/).exec(data)[1],
					'code': (/id="paste_code"[^>]*>([^]*)<\/textarea>/m).exec(data)[1]
				}
			};
		},
		'prntscr': function(data) {
			var imgReg = /(https?:\/\/i\.imgur\.com\/[^"]+)/;
			var removedReg = /https?:\/\/i\.imgur\.com\/8tdUI8N\.png/; // j'espère que tu as honte de toi prntscr...

			var removed = removedReg.exec(data);
			var imgUrl = imgReg.exec(data);

			// l'image n'existe pas
			if(removed !== null) {
				return {
					'abort': {
						'title': 'Prntscr - Cette image n\'existe pas.',
						'show': true
					}
				};
			}

			return {
				'displayMethod': 'basic-image',
				'data': {
					'title': 'Prntscr - Image',
					'url': imgUrl
				}
			};
		},
		'imgur': function(data) {
			var dataReg = /images? +: +({.*),\n/;
			var titleReg = /<title>[\n ]+(.*) - .*Imgur<\/title>/;
			var existsReg = /(<title> +imgur: +the simple 404 page<\/title>)/;


			if(existsReg.exec(data) !== null) {
				return {
					'abort': {
						'title': 'Imgur - Cette image n\'existe pas.',
						'show': true
					}
				};
			}

			var imgData = JSON.parse(dataReg.exec(data)[1]);

			// it's an album
			if(imgData.images) {
				var title = titleReg.exec(data);
				title = title ? 'Imgur - ' + title[1] : 'Imgur - Album';
				imgData = imgData.images;

				var ret = [];
				for(var i = 0; i < imgData.length; ++i) {
					ret.push({
						'description': imgData[i].description,
						'url': 'https://i.imgur.com/' + imgData[i].hash + imgData[i].ext,
						'title': imgData[i].title
					});
				}

				return {
					'displayMethod': 'gallery-image',
					'data': {
						'title': title,
						'images': ret
					}
				};
			}
			else {
				return {
					'displayMethod': 'basic-image',
					'data': {
						'title': imgData.title ? 'Imgur - ' + imgData.title : 'Imgur - Image',
						'url': 'https://i.imgur.com/' + imgData.hash + imgData.ext
					}
				};
			}
		},
		'youtube': function(data) {
			if(data.trim().toLowerCase() === 'not found') {
				return {
					abort: {
						'title': 'Youtube - Cette vidéo n\'existe pas.',
						'show': true
					}
				};
			}

			var data = JSON.parse(data.replace('\\"', '@'));
			var url = $(data.html.replace('@', '"')).attr('src'); // ça drop les infos de playlist :(
			return {
				'displayMethod': 'youtube',
				'data': {
					'url': url,
					'title': 'Youtube - ' + data.title.replace('@', '"')
				},
			};
		},
		'vimeo': function(data) {
			if(data.trim().toLowerCase() === '404 not found') {
				return {
					abort: {
						'title': 'Vimeo - Cette vidéo n\'existe pas.',
						'show': true
					}
				};
			}


			var data = JSON.parse(data.replace('\\"', '@'));
			var url = data.uri.replace('@', '"').replace('\\/', '/').replace('videos', 'video');

			return {
				'displayMethod': 'vimeo',
				'data': {
					'url': 'https://player.vimeo.com' + url,
					'title': 'Vimeo - ' + data.title
				}
			};
		},
		'soundcloud': function(data) {
			if(data.trim().length === 0) {
				return {
					'abort': {
						'title': 'Soundcloud - Ce son n\'existe pas.',
						'show': true
					}
				};
			}

			var data = JSON.parse(data.replace('\\"', '@'));
			var url = $(data.html.replace('@', '"')).attr('src');

			return {
				'displayMethod': 'soundcloud',
				'data': {
					'title': 'Soundcloud - ' + data.title,
					'url': url
				}
			};
		}
	};

	var displayMethods = {
		'pastebin': function(data) {
			var elem = $(document.createElement('pre'));
			var code = $(document.createElement('code'));

			elem.add(code).addClass('language-' + data.language.toLowerCase()).addClass('line-numbers');

			code.html(data.code);
			elem.append(code);

			return {
				'title': (data.title.toLowerCase() === 'unknown') ? 'Pastebin - Sans titre' : 'Pastebin - ' + data.title.trim(),
				'elem': elem,
				'post': 'pastebin'
			};
		},
		'youtube': function(data) {
			var wrapper = $(document.createElement('div')); // permet d'avoir des vidéos à largeur fluide
			var frame = $(document.createElement('iframe'));

			wrapper.addClass('clp-fluid-iframe');

			frame.attr('src', data.url);
			frame.attr('allowfullscreen', 'true');
			frame.attr('frameborder', '0');

			wrapper.append(frame);

			return {
				'title': data.title,
				'elem': wrapper,
				'foldEvent': 'youtube-controls'
			};
		},
		'vimeo': function(data) {
			var wrapper = $(document.createElement('div')); // permet d'avoir des vidéos à largeur fluide
			var frame = $(document.createElement('iframe'));

			wrapper.addClass('clp-fluid-iframe');

			frame.attr('src', data.url);
			frame.attr('allowfullscreen', 'true');
			frame.attr('frameborder', '0');

			wrapper.append(frame);

			return {
				'title': data.title,
				'elem': wrapper,
				'foldEvent': 'vimeo-controls'
			};
		},
		'soundcloud': function(data) {
			var wrapper = $(document.createElement('div')); // permet d'avoir des vidéos à largeur fluide
			var frame = $(document.createElement('iframe'));

			frame.attr('src', data.url);
			frame.attr('frameborder', 'no');
			frame.css('width', '100%');
			frame.attr('scrolling', 'no');

			wrapper.append(frame);

			return {
				'title': data.title,
				'elem': wrapper,
				'foldEvent': 'soundcloud-controls'
			};
		},
		'basic-image': function(data) {
			var img = $(document.createElement('img'));
			img.attr('src', data.url).addClass('clp-basic-image');
			img.click(function() {
				$(this).toggleClass('clp-image-zoomed');
			});

			return {
				'title': data.title,
				'elem': img
			}
		},
		'gallery-image': function(data) {
			var cont = $(document.createElement('div'));
			var images = $(document.createElement('div'));
			var title = $(document.createElement('div'));
			var toLeft = $(document.createElement('div'));
			var toRight = $(document.createElement('div'));
			var desc = $(document.createElement('div'));
			var img = $(document.createElement('img'));

			cont.addClass('clp-album-cont');
			images.addClass('clp-album-images');
			title.addClass('clp-album-title');
			toLeft.addClass('clp-album-changer').addClass('clp-album-toleft');
			toRight.addClass('clp-album-changer').addClass('clp-album-toright');
			desc.addClass('clp-album-description');

			images.append(img);
			cont.append(images);
			cont.append(title);
			cont.append(desc);
			cont.append(toLeft);
			cont.append(toRight);

			cont.attr('data-index', 0);

			function setIndex(n) {
				n = n%data.images.length;
				cont.attr('data-index', n);
				img.attr('src', data.images[n].url);
				if(data.images[n].description.trim() == '') {
					desc.addClass('clp-empty');
				}
				else {
					desc.html(data.images[n].description);
					desc.removeClass('clp-empty');
				}
				title.html('<span>[' + (n+1) + '/' + data.images.length + ']</span>' + data.images[n].title);
			}

			setIndex(0);

			toLeft.click(function() {
				setIndex(parseInt(cont.attr('data-index')) - 1 + data.images.length);
			});

			toRight.click(function() {
				setIndex(parseInt(cont.attr('data-index')) + 1);
			});

			img.click(function() {
				cont.toggleClass('zoomed');
			});

			return {
				'title': data.title,
				'elem': cont
			};
		}
	};

	var posts = {
		'pastebin': function(elem) {
			Prism.highlightElement(elem.find('code')[0], elem.find('code').html().length > 10000, function(){});
		}
	};

	var foldEvents = {
		'youtube-controls': function(elem, folded) {
			if(!folded) return;
			elem = elem.find('iframe').first();
			elem.attr('src', elem.attr('src')); // refresh l'iframe. Evite de devoir charger l'API youtube pour couper
		},
		'vimeo-controls': function(elem, folded) {
			if(!folded) return;
			elem = elem.find('iframe').first();
			elem.attr('src', elem.attr('src')); // todo : voir si possible de mettre en pause vimeo de manière simple
		},
		'soundcloud-controls': function(elem, folded) {
			if(!folded) return;
			elem = elem.find('iframe').first();
			elem.attr('src', elem.attr('src')); // todo : voir si possible de mettre en pause vimeo de manière simple
		}
	};

	/*************************************************************************************************************************
	**************************************** CORE FUNCTIONS -- NO NEED TO MODIFY *********************************************
	*************************************************************************************************************************/

	function check() {
		var links = $('.chat-message-messages a:not(.clp-checked)');

		links.each(function() {
			var current = $(this);
			current.addClass('clp-checked');
			var url = current.attr('href');
			var matcher = getMatcher(url);

			if(!matcher) return; // on ne traite pas ce lien

			gen({
				'request': matcher,
				'url': url
			}, function(elem) {
				if(elem === null) return;
				// on insère l'élément généré
				displayUnfurl(current, {
					title: elem.title,
					description: elem.description,
					elem: elem.elem
				});
				// on appelle le post si nécessaire
				if(elem.post) {
					posts[elem.post]($(elem.elem));
				}

				// gérer les fold events de manière propre
				if(elem.foldEvent) {
					$(current).find(' + .clp-cont .clp-title').click(function() {
						foldEvents[elem.foldEvent]($($(current).find('+ .clp-cont .clp-elem > *')[0]), $(current).hasClass('clp-folded'));
					});
				}
			});

		});
	}

	function getRessource(ressource, callback, errorCallback) {
		var ret = GM_xmlhttpRequest({
			method: 'GET',
			url: ressource,
			onload: function(res) {
				callback(res.responseText);
			},
			onerror: errorCallback ? errorCallback : function(){},
			onabort: errorCallback ? errorCallback : function(){}
		});
	}

	function getMatcher(url) {
		for(var i in matchers) {
			if(matchers.hasOwnProperty(i) && matchers[i].match(url)) {
				return i;
			}
		}
		return null;
	}

	function gen(data, callback) {
		if(data.abort) {
			callback({
				'aborted': true,
				'title': data.abort.title || 'Erreur',
				'description': data.abort.description || null,
				'show': data.abort.show || false
			});
			return;
		}

		if(data.request) {
			// il doit y avoir une url fournie
			if(!data.url || !matchers[data.request].match(data.url)) {
				callback(null);
				return;
			}
			gen(matchers[data.request].request(data.url), callback);
		}
		else if(data.handler) {
			if(!data.url) {
				callback(null);
				return;
			}
			if(!data.loadURL) data.loadURL = true;
			if(!data.loadURL) {
				gen(handlers[data.handler](data.url), callback);
			}
			else {
				getRessource(data.url, function(loaded) {
					gen(handlers[data.handler](loaded), callback);
				}, function() {
					callback(null);
				});
			}
		}
		else if(data.data) {
			if(!data.displayMethod) {
				data.displayMethod = displayMethods['default'](data.data);
			}
			gen(displayMethods[data.displayMethod](data.data), callback);
		}
		else if(data.elem) { // l'élément a été généré
			callback({
				'elem': data.elem,
				'post': data.post,
				'foldEvent': data.foldEvent,
				'title': data.title,
				'description': data.description
			});
		}
		callback(null);
	}

	function displayUnfurl(link, data) {
		var cont = $(document.createElement('div'));
		var title = $(document.createElement('div'));
		var description = $(document.createElement('div'));
		var elem = $(document.createElement('div'));

		cont.addClass('clp-cont');
		title.addClass('clp-title');
		description.addClass('clp-description');
		elem.addClass('clp-elem');
		link.addClass('clp-folded');

		title.html(data.title);
		description.html(data.description);
		elem.append(data.elem);

		// ajout de la flèche à droite du titre
		if(data.elem) {
			title.append('<span></span>');
			title.mousedown(function(e) {
				if(e.which === 1) {
					link.toggleClass('clp-folded');
				}
				else if(e.which === 2) { // middle button
					link[0].click();
					e.preventDefault();
				}
			});
		}

		cont.append(title);
		if(data.description) cont.append(description);
		if(data.elem) cont.append(elem);
		cont.insertAfter(link);
	}

	setInterval(check, 100);

	GM_addStyle('.clp-cont div > pre { \
			overflow: hidden; \
			border: solid 1px hsl(0, 0%, 70%); \
			border-radius: 10px; \
		} \
		.clp-title span { \
			display: inline-block; \
			width: 0.7em; \
			height: 0.7em; \
			background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMzczLjAwOHB4IiBoZWlnaHQ9IjM3My4wMDhweCIgdmlld0JveD0iMCAwIDM3My4wMDggMzczLjAwOCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZmlsbD0iIzY2NiIgZD0iTTYxLjc5MiwyLjU4OEM2NC43NzEsMC44NjQsNjguMTA1LDAsNzEuNDQ0LDBjMy4zMywwLDYuNjYzLDAuODY0LDkuNjU1LDIuNTg4bDIzMC4xMTYsMTY3LjJjNS45NjMsMy40NDUsOS42NTYsOS44MjMsOS42NTYsMTYuNzE5YzAsNi44OTUtMy42ODMsMTMuMjcyLTkuNjU2LDE2LjcxM0w4MS4wOTksMzcwLjQyN2MtNS45NzIsMy40NDEtMTMuMzM0LDMuNDQxLTE5LjMwMiwwYy01Ljk3My0zLjQ1My05LjY2LTkuODMzLTkuNjYtMTYuNzI0VjE5LjMwNUM1Mi4xMzcsMTIuNDEzLDU1LjgxOCw2LjAzNiw2MS43OTIsMi41ODh6Ii8+PC9zdmc+); \
			background-size: contain; \
			margin-left: 7px; \
			transition: ease transform 0.3s; \
			transform: rotate(90deg); \
		} \
		a.clp-folded + .clp-cont .clp-title span { \
			transform: rotate(0deg); \
		} \
		a.clp-folded + .clp-cont .clp-elem { \
			display: none; \
		}\
		.clp-cont { \
			border-left: solid 3px hsla(0, 0%, 0%, 0.2); \
			padding: 3px 0px 3px 15px; \
			margin: 7px 0; \
		} \
		.clp-title { \
			color: hsl(0, 0%, 40%); \
			cursor: pointer; \
			display: inline-block; \
		} \
		.clp-elem { \
			margin: 0.5em 0 0 0; \
		} \
		.clp-basic-image { \
			max-width: 100%; \
			max-height: ' + getMaxMediaHeight() + 'px; \
			cursor: zoom-in; \
			border-radius: 7px; \
		} \
		.clp-basic-image.clp-image-zoomed { \
			cursor: zoom-out; \
			max-height: none; \
		} \
		.clp-album-cont { \
			width: 100%; \
			height: ' + getMaxMediaHeight() + 'px; \
			position: relative; \
			overflow: hidden; \
		} \
		.clp-album-images { \
			display: flex; \
			width: 100%; \
			height: 100%; \
			background-color: hsl(0, 0%, 11%); \
			overflow: hidden; \
		} \
		.clp-album-title { \
			top: calc(-1.2em - 11px); \
			left: 60px; \
			right: 60px; \
			position: absolute; \
			text-align: center; \
			background-color: hsla(0, 0%, 0%, 0.9); \
			color: white; \
			font-size: 1.2em; \
			padding: 5px; \
			border-bottom: solid 1px black; \
			height: 1.2em; \
			overflow: hidden; \
			text-overflow: ellipsis; \
			padding: 5px 70px; \
			white-space: nowrap; \
		} \
		.clp-album-title span { \
			position: absolute; \
			left: 10px; \
		} \
		.clp-album-description { \
			position: absolute; \
			bottom: -100%; \
			left: 60px; \
			right: 60px; \
			background-color: hsla(0, 0%, 0%, 0.9); \
			color: white; \
			padding: 10px 20px; \
			border-top: solid 1px black; \
			text-shadow: 1px 1px black; \
			max-height: calc(100% - 1.2em - 12px); \
			overflow: hidden; \
			text-overflow: ellipsis; \
		} \
		.clp-album-changer { \
			position: absolute; \
			background-color: hsla(0, 0%, 0%, 0.7); \
			width: 60px; \
			top: 0; \
			bottom: 0; \
			background-image: url(data:image/svg+xml;charset=utf-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNDQuMjM2cHgiIGhlaWdodD0iNDQuMjM2cHgiIHZpZXdCb3g9IjAgMCA0NC4yMzYgNDQuMjM2IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBmaWxsPSIjY2NjY2NjIiBkPSJNMjIuMTE4LDQ0LjIzNkM5LjkyMiw0NC4yMzYsMCwzNC4zMTQsMCwyMi4xMThTOS45MjIsMCwyMi4xMTgsMHMyMi4xMTgsOS45MjIsMjIuMTE4LDIyLjExOFMzNC4zMTQsNDQuMjM2LDIyLjExOCw0NC4yMzZ6IE0yMi4xMTgsMS41QzEwLjc1LDEuNSwxLjUsMTAuNzQ5LDEuNSwyMi4xMThjMCwxMS4zNjgsOS4yNSwyMC42MTgsMjAuNjE4LDIwLjYxOGMxMS4zNywwLDIwLjYxOC05LjI1LDIwLjYxOC0yMC42MThDNDIuNzM2LDEwLjc0OSwzMy40ODgsMS41LDIyLjExOCwxLjV6Ii8+PHBhdGggZmlsbD0iI2NjY2NjYyIgZD0iTTE5LjM0MSwyOS44ODRjLTAuMTkyLDAtMC4zODQtMC4wNzMtMC41My0wLjIyYy0wLjI5My0wLjI5Mi0wLjI5My0wLjc2OCwwLTEuMDYxbDYuNzk2LTYuODA0bC02Ljc5Ni02LjgwM2MtMC4yOTItMC4yOTMtMC4yOTItMC43NjksMC0xLjA2MWMwLjI5My0wLjI5MywwLjc2OC0wLjI5MywxLjA2MSwwbDcuMzI1LDcuMzMzYzAuMjkzLDAuMjkzLDAuMjkzLDAuNzY4LDAsMS4wNjFsLTcuMzI1LDcuMzMzQzE5LjcyNSwyOS44MTEsMTkuNTMzLDI5Ljg4NCwxOS4zNDEsMjkuODg0eiIvPjwvZz48L3N2Zz4=); \
			background-repeat: no-repeat; \
			background-position: center; \
			border-left: solid 1px black; \
			cursor: pointer; \
		} \
		.clp-album-toright { \
			right: -61px; \
		} \
		.clp-album-toleft { \
			transform: rotate(180deg); \
			left: -61px; \
		} \
		.clp-album-cont > * {\
			transition: ease all 0.4s; \
		} \
		.clp-album-changer:hover { \
			background-color: hsla(0, 0%, 0%, 0.9); \
		} \
		.clp-album-cont:hover .clp-album-toleft { \
			left: 0; \
		} \
		.clp-album-cont:hover .clp-album-toright { \
			right: 0; \
		} \
		.clp-album-cont:hover .clp-album-title:not(.clp-empty) { \
			top: 0; \
		} \
		.clp-album-cont:hover .clp-album-description:not(.clp-empty) { \
			bottom: 0; \
		} \
		.clp-album-cont .clp-album-images img { \
			max-width: 100%; \
			max-height: 100%; \
			margin: auto; \
			cursor: zoom-in; \
		} \
		.clp-album-cont.zoomed .clp-album-images img { \
			cursor: zoom-out; \
			width: 100%; \
			max-height: none; \
		} \
		.clp-album-cont.zoomed { \
			height: auto; \
		} \
		.clp-fluid-iframe.zoomed { \
			position: relative; \
			padding-top: 25px; \
			padding-bottom: 56.25%; \
			height: 0; \
			width: 100%; \
		} \
		.clp-fluid-iframe { \
			padding-bottom: ' + getMaxMediaHeight() + 'px; \
			width: 53%; \
			position: relative; \
		} \
		.clp-fluid-iframe iframe { \
			position: absolute; \
			top: 0; \
			left: 0; \
			width: 100%; \
			height: 100%; \
		}');

		// chargement de l'API youtube (à delayer)
		// ytp-play-button ytp-button

})();







// PRISM
/* http://prismjs.com/download.html?themes=prism&languages=markup+css+clike+javascript+bash+c+csharp+cpp+ruby+ini+java+latex+markdown+objectivec+php+python+sql&plugins=line-numbers */
var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(){var e=/\blang(?:uage)?-(?!\*)(\w+)\b/i,t=_self.Prism={util:{encode:function(e){return e instanceof n?new n(e.type,t.util.encode(e.content),e.alias):"Array"===t.util.type(e)?e.map(t.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},clone:function(e){var n=t.util.type(e);switch(n){case"Object":var a={};for(var r in e)e.hasOwnProperty(r)&&(a[r]=t.util.clone(e[r]));return a;case"Array":return e.map&&e.map(function(e){return t.util.clone(e)})}return e}},languages:{extend:function(e,n){var a=t.util.clone(t.languages[e]);for(var r in n)a[r]=n[r];return a},insertBefore:function(e,n,a,r){r=r||t.languages;var l=r[e];if(2==arguments.length){a=arguments[1];for(var i in a)a.hasOwnProperty(i)&&(l[i]=a[i]);return l}var o={};for(var s in l)if(l.hasOwnProperty(s)){if(s==n)for(var i in a)a.hasOwnProperty(i)&&(o[i]=a[i]);o[s]=l[s]}return t.languages.DFS(t.languages,function(t,n){n===r[e]&&t!=e&&(this[t]=o)}),r[e]=o},DFS:function(e,n,a){for(var r in e)e.hasOwnProperty(r)&&(n.call(e,r,e[r],a||r),"Object"===t.util.type(e[r])?t.languages.DFS(e[r],n):"Array"===t.util.type(e[r])&&t.languages.DFS(e[r],n,r))}},plugins:{},highlightAll:function(e,n){for(var a,r=document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'),l=0;a=r[l++];)t.highlightElement(a,e===!0,n)},highlightElement:function(n,a,r){for(var l,i,o=n;o&&!e.test(o.className);)o=o.parentNode;o&&(l=(o.className.match(e)||[,""])[1],i=t.languages[l]),n.className=n.className.replace(e,"").replace(/\s+/g," ")+" language-"+l,o=n.parentNode,/pre/i.test(o.nodeName)&&(o.className=o.className.replace(e,"").replace(/\s+/g," ")+" language-"+l);var s=n.textContent,u={element:n,language:l,grammar:i,code:s};if(!s||!i)return t.hooks.run("complete",u),void 0;if(t.hooks.run("before-highlight",u),a&&_self.Worker){var g=new Worker(t.filename);g.onmessage=function(e){u.highlightedCode=e.data,t.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,r&&r.call(u.element),t.hooks.run("after-highlight",u),t.hooks.run("complete",u)},g.postMessage(JSON.stringify({language:u.language,code:u.code,immediateClose:!0}))}else u.highlightedCode=t.highlight(u.code,u.grammar,u.language),t.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,r&&r.call(n),t.hooks.run("after-highlight",u),t.hooks.run("complete",u)},highlight:function(e,a,r){var l=t.tokenize(e,a);return n.stringify(t.util.encode(l),r)},tokenize:function(e,n){var a=t.Token,r=[e],l=n.rest;if(l){for(var i in l)n[i]=l[i];delete n.rest}e:for(var i in n)if(n.hasOwnProperty(i)&&n[i]){var o=n[i];o="Array"===t.util.type(o)?o:[o];for(var s=0;s<o.length;++s){var u=o[s],g=u.inside,c=!!u.lookbehind,f=0,h=u.alias;u=u.pattern||u;for(var p=0;p<r.length;p++){var d=r[p];if(r.length>e.length)break e;if(!(d instanceof a)){u.lastIndex=0;var m=u.exec(d);if(m){c&&(f=m[1].length);var y=m.index-1+f,m=m[0].slice(f),v=m.length,k=y+v,b=d.slice(0,y+1),w=d.slice(k+1),P=[p,1];b&&P.push(b);var A=new a(i,g?t.tokenize(m,g):m,h);P.push(A),w&&P.push(w),Array.prototype.splice.apply(r,P)}}}}}return r},hooks:{all:{},add:function(e,n){var a=t.hooks.all;a[e]=a[e]||[],a[e].push(n)},run:function(e,n){var a=t.hooks.all[e];if(a&&a.length)for(var r,l=0;r=a[l++];)r(n)}}},n=t.Token=function(e,t,n){this.type=e,this.content=t,this.alias=n};if(n.stringify=function(e,a,r){if("string"==typeof e)return e;if("Array"===t.util.type(e))return e.map(function(t){return n.stringify(t,a,e)}).join("");var l={type:e.type,content:n.stringify(e.content,a,r),tag:"span",classes:["token",e.type],attributes:{},language:a,parent:r};if("comment"==l.type&&(l.attributes.spellcheck="true"),e.alias){var i="Array"===t.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(l.classes,i)}t.hooks.run("wrap",l);var o="";for(var s in l.attributes)o+=(o?" ":"")+s+'="'+(l.attributes[s]||"")+'"';return"<"+l.tag+' class="'+l.classes.join(" ")+'" '+o+">"+l.content+"</"+l.tag+">"},!_self.document)return _self.addEventListener?(_self.addEventListener("message",function(e){var n=JSON.parse(e.data),a=n.language,r=n.code,l=n.immediateClose;_self.postMessage(t.highlight(r,t.languages[a],a)),l&&_self.close()},!1),_self.Prism):_self.Prism;var a=document.getElementsByTagName("script");return a=a[a.length-1],a&&(t.filename=a.src,document.addEventListener&&!a.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",t.highlightAll)),_self.Prism}();"undefined"!=typeof module&&module.exports&&(module.exports=Prism),"undefined"!=typeof global&&(global.Prism=Prism);
Prism.languages.markup={comment:/<!--[\w\W]*?-->/,prolog:/<\?[\w\W]+?\?>/,doctype:/<!DOCTYPE[\w\W]+?>/,cdata:/<!\[CDATA\[[\w\W]*?]]>/i,tag:{pattern:/<\/?(?!\d)[^\s>\/=.$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\\1|\\?(?!\1)[\w\W])*\1|[^\s'">=]+))?)*\s*\/?>/i,inside:{tag:{pattern:/^<\/?[^\s>\/]+/i,inside:{punctuation:/^<\/?/,namespace:/^[^\s>\/:]+:/}},"attr-value":{pattern:/=(?:('|")[\w\W]*?(\1)|[^\s>]+)/i,inside:{punctuation:/[=>"']/}},punctuation:/\/?>/,"attr-name":{pattern:/[^\s>\/]+/,inside:{namespace:/^[^\s>\/:]+:/}}}},entity:/&#?[\da-z]{1,8};/i},Prism.hooks.add("wrap",function(a){"entity"===a.type&&(a.attributes.title=a.content.replace(/&amp;/,"&"))}),Prism.languages.xml=Prism.languages.markup,Prism.languages.html=Prism.languages.markup,Prism.languages.mathml=Prism.languages.markup,Prism.languages.svg=Prism.languages.markup;
Prism.languages.css={comment:/\/\*[\w\W]*?\*\//,atrule:{pattern:/@[\w-]+?.*?(;|(?=\s*\{))/i,inside:{rule:/@[\w-]+/}},url:/url\((?:(["'])(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,selector:/[^\{\}\s][^\{\};]*?(?=\s*\{)/,string:/("|')(\\(?:\r\n|[\w\W])|(?!\1)[^\\\r\n])*\1/,property:/(\b|\B)[\w-]+(?=\s*:)/i,important:/\B!important\b/i,"function":/[-a-z0-9]+(?=\()/i,punctuation:/[(){};:]/},Prism.languages.css.atrule.inside.rest=Prism.util.clone(Prism.languages.css),Prism.languages.markup&&(Prism.languages.insertBefore("markup","tag",{style:{pattern:/(<style[\w\W]*?>)[\w\W]*?(?=<\/style>)/i,lookbehind:!0,inside:Prism.languages.css,alias:"language-css"}}),Prism.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|').*?\1/i,inside:{"attr-name":{pattern:/^\s*style/i,inside:Prism.languages.markup.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/i,inside:Prism.languages.css}},alias:"language-css"}},Prism.languages.markup.tag));
Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\w\W]*?\*\//,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0}],string:/(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,"class-name":{pattern:/((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,"boolean":/\b(true|false)\b/,"function":/[a-z0-9_]+(?=\()/i,number:/\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,operator:/--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,punctuation:/[{}[\];(),.:]/};
Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,number:/\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,"function":/[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i}),Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^\/])\/(?!\/)(\[.+?]|\\.|[^\/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,lookbehind:!0}}),Prism.languages.insertBefore("javascript","class-name",{"template-string":{pattern:/`(?:\\`|\\?[^`])*`/,inside:{interpolation:{pattern:/\$\{[^}]+\}/,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:Prism.languages.javascript}},string:/[\s\S]+/}}}),Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,lookbehind:!0,inside:Prism.languages.javascript,alias:"language-javascript"}}),Prism.languages.js=Prism.languages.javascript;
!function(e){var t={variable:[{pattern:/\$?\(\([\w\W]+?\)\)/,inside:{variable:[{pattern:/(^\$\(\([\w\W]+)\)\)/,lookbehind:!0},/^\$\(\(/],number:/\b-?(?:0x[\dA-Fa-f]+|\d*\.?\d+(?:[Ee]-?\d+)?)\b/,operator:/--?|-=|\+\+?|\+=|!=?|~|\*\*?|\*=|\/=?|%=?|<<=?|>>=?|<=?|>=?|==?|&&?|&=|\^=?|\|\|?|\|=|\?|:/,punctuation:/\(\(?|\)\)?|,|;/}},{pattern:/\$\([^)]+\)|`[^`]+`/,inside:{variable:/^\$\(|^`|\)$|`$/}},/\$(?:[a-z0-9_#\?\*!@]+|\{[^}]+\})/i]};e.languages.bash={shebang:{pattern:/^#!\s*\/bin\/bash|^#!\s*\/bin\/sh/,alias:"important"},comment:{pattern:/(^|[^"{\\])#.*/,lookbehind:!0},string:[{pattern:/((?:^|[^<])<<\s*)(?:"|')?(\w+?)(?:"|')?\s*\r?\n(?:[\s\S])*?\r?\n\2/g,lookbehind:!0,inside:t},{pattern:/("|')(?:\\?[\s\S])*?\1/g,inside:t}],variable:t.variable,"function":{pattern:/(^|\s|;|\||&)(?:alias|apropos|apt-get|aptitude|aspell|awk|basename|bash|bc|bg|builtin|bzip2|cal|cat|cd|cfdisk|chgrp|chmod|chown|chroot|chkconfig|cksum|clear|cmp|comm|command|cp|cron|crontab|csplit|cut|date|dc|dd|ddrescue|df|diff|diff3|dig|dir|dircolors|dirname|dirs|dmesg|du|egrep|eject|enable|env|ethtool|eval|exec|expand|expect|export|expr|fdformat|fdisk|fg|fgrep|file|find|fmt|fold|format|free|fsck|ftp|fuser|gawk|getopts|git|grep|groupadd|groupdel|groupmod|groups|gzip|hash|head|help|hg|history|hostname|htop|iconv|id|ifconfig|ifdown|ifup|import|install|jobs|join|kill|killall|less|link|ln|locate|logname|logout|look|lpc|lpr|lprint|lprintd|lprintq|lprm|ls|lsof|make|man|mkdir|mkfifo|mkisofs|mknod|more|most|mount|mtools|mtr|mv|mmv|nano|netstat|nice|nl|nohup|notify-send|nslookup|open|op|passwd|paste|pathchk|ping|pkill|popd|pr|printcap|printenv|printf|ps|pushd|pv|pwd|quota|quotacheck|quotactl|ram|rar|rcp|read|readarray|readonly|reboot|rename|renice|remsync|rev|rm|rmdir|rsync|screen|scp|sdiff|sed|seq|service|sftp|shift|shopt|shutdown|sleep|slocate|sort|source|split|ssh|stat|strace|su|sudo|sum|suspend|sync|tail|tar|tee|test|time|timeout|times|touch|top|traceroute|trap|tr|tsort|tty|type|ulimit|umask|umount|unalias|uname|unexpand|uniq|units|unrar|unshar|uptime|useradd|userdel|usermod|users|uuencode|uudecode|v|vdir|vi|vmstat|wait|watch|wc|wget|whereis|which|who|whoami|write|xargs|xdg-open|yes|zip)(?=$|\s|;|\||&)/,lookbehind:!0},keyword:{pattern:/(^|\s|;|\||&)(?:let|:|\.|if|then|else|elif|fi|for|break|continue|while|in|case|function|select|do|done|until|echo|exit|return|set|declare)(?=$|\s|;|\||&)/,lookbehind:!0},"boolean":{pattern:/(^|\s|;|\||&)(?:true|false)(?=$|\s|;|\||&)/,lookbehind:!0},operator:/&&?|\|\|?|==?|!=?|<<<?|>>|<=?|>=?|=~/,punctuation:/\$?\(\(?|\)\)?|\.\.|[{}[\];]/};var a=t.variable[1].inside;a["function"]=e.languages.bash["function"],a.keyword=e.languages.bash.keyword,a.boolean=e.languages.bash.boolean,a.operator=e.languages.bash.operator,a.punctuation=e.languages.bash.punctuation}(Prism);
Prism.languages.c=Prism.languages.extend("clike",{keyword:/\b(asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b/,operator:/\-[>-]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|?\||[~^%?*\/]/,number:/\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)[ful]*\b/i}),Prism.languages.insertBefore("c","string",{macro:{pattern:/(^\s*)#\s*[a-z]+([^\r\n\\]|\\.|\\(?:\r\n?|\n))*/im,lookbehind:!0,alias:"property",inside:{string:{pattern:/(#\s*include\s*)(<.+?>|("|')(\\?.)+?\3)/,lookbehind:!0},directive:{pattern:/(#\s*)\b(define|elif|else|endif|error|ifdef|ifndef|if|import|include|line|pragma|undef|using)\b/,lookbehind:!0,alias:"keyword"}}},constant:/\b(__FILE__|__LINE__|__DATE__|__TIME__|__TIMESTAMP__|__func__|EOF|NULL|stdin|stdout|stderr)\b/}),delete Prism.languages.c["class-name"],delete Prism.languages.c["boolean"];
Prism.languages.csharp=Prism.languages.extend("clike",{keyword:/\b(abstract|as|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while|add|alias|ascending|async|await|descending|dynamic|from|get|global|group|into|join|let|orderby|partial|remove|select|set|value|var|where|yield)\b/,string:[/@("|')(\1\1|\\\1|\\?(?!\1)[\s\S])*\1/,/("|')(\\?.)*?\1/],number:/\b-?(0x[\da-f]+|\d*\.?\d+f?)\b/i}),Prism.languages.insertBefore("csharp","keyword",{preprocessor:{pattern:/(^\s*)#.*/m,lookbehind:!0,alias:"property",inside:{directive:{pattern:/(\s*#)\b(define|elif|else|endif|endregion|error|if|line|pragma|region|undef|warning)\b/,lookbehind:!0,alias:"keyword"}}}});
Prism.languages.cpp=Prism.languages.extend("c",{keyword:/\b(alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|class|compl|const|constexpr|const_cast|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|nullptr|operator|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/,"boolean":/\b(true|false)\b/,operator:/[-+]{1,2}|!=?|<{1,2}=?|>{1,2}=?|\->|:{1,2}|={1,2}|\^|~|%|&{1,2}|\|?\||\?|\*|\/|\b(and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/}),Prism.languages.insertBefore("cpp","keyword",{"class-name":{pattern:/(class\s+)[a-z0-9_]+/i,lookbehind:!0}});
!function(e){e.languages.ruby=e.languages.extend("clike",{comment:/#(?!\{[^\r\n]*?\}).*/,keyword:/\b(alias|and|BEGIN|begin|break|case|class|def|define_method|defined|do|each|else|elsif|END|end|ensure|false|for|if|in|module|new|next|nil|not|or|raise|redo|require|rescue|retry|return|self|super|then|throw|true|undef|unless|until|when|while|yield)\b/});var n={pattern:/#\{[^}]+\}/,inside:{delimiter:{pattern:/^#\{|\}$/,alias:"tag"},rest:e.util.clone(e.languages.ruby)}};e.languages.insertBefore("ruby","keyword",{regex:[{pattern:/%r([^a-zA-Z0-9\s\{\(\[<])(?:[^\\]|\\[\s\S])*?\1[gim]{0,3}/,inside:{interpolation:n}},{pattern:/%r\((?:[^()\\]|\\[\s\S])*\)[gim]{0,3}/,inside:{interpolation:n}},{pattern:/%r\{(?:[^#{}\\]|#(?:\{[^}]+\})?|\\[\s\S])*\}[gim]{0,3}/,inside:{interpolation:n}},{pattern:/%r\[(?:[^\[\]\\]|\\[\s\S])*\][gim]{0,3}/,inside:{interpolation:n}},{pattern:/%r<(?:[^<>\\]|\\[\s\S])*>[gim]{0,3}/,inside:{interpolation:n}},{pattern:/(^|[^\/])\/(?!\/)(\[.+?]|\\.|[^\/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/,lookbehind:!0}],variable:/[@$]+[a-zA-Z_][a-zA-Z_0-9]*(?:[?!]|\b)/,symbol:/:[a-zA-Z_][a-zA-Z_0-9]*(?:[?!]|\b)/}),e.languages.insertBefore("ruby","number",{builtin:/\b(Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Stat|File|Fixnum|Fload|Hash|Integer|IO|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|String|Struct|TMS|Symbol|ThreadGroup|Thread|Time|TrueClass)\b/,constant:/\b[A-Z][a-zA-Z_0-9]*(?:[?!]|\b)/}),e.languages.ruby.string=[{pattern:/%[qQiIwWxs]?([^a-zA-Z0-9\s\{\(\[<])(?:[^\\]|\\[\s\S])*?\1/,inside:{interpolation:n}},{pattern:/%[qQiIwWxs]?\((?:[^()\\]|\\[\s\S])*\)/,inside:{interpolation:n}},{pattern:/%[qQiIwWxs]?\{(?:[^#{}\\]|#(?:\{[^}]+\})?|\\[\s\S])*\}/,inside:{interpolation:n}},{pattern:/%[qQiIwWxs]?\[(?:[^\[\]\\]|\\[\s\S])*\]/,inside:{interpolation:n}},{pattern:/%[qQiIwWxs]?<(?:[^<>\\]|\\[\s\S])*>/,inside:{interpolation:n}},{pattern:/("|')(#\{[^}]+\}|\\(?:\r?\n|\r)|\\?.)*?\1/,inside:{interpolation:n}}]}(Prism);
Prism.languages.ini={comment:/^[ \t]*;.*$/m,important:/\[.*?\]/,constant:/^[ \t]*[^\s=]+?(?=[ \t]*=)/m,"attr-value":{pattern:/=.*/,inside:{punctuation:/^[=]/}}};
Prism.languages.java=Prism.languages.extend("clike",{keyword:/\b(abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while)\b/,number:/\b0b[01]+\b|\b0x[\da-f]*\.?[\da-fp\-]+\b|\b\d*\.?\d+(?:e[+-]?\d+)?[df]?\b/i,operator:{pattern:/(^|[^.])(?:\+[+=]?|-[-=]?|!=?|<<?=?|>>?>?=?|==?|&[&=]?|\|[|=]?|\*=?|\/=?|%=?|\^=?|[?:~])/m,lookbehind:!0}});
!function(a){var e=/\\([^a-z()[\]]|[a-z\*]+)/i,n={"equation-command":{pattern:e,alias:"regex"}};a.languages.latex={comment:/%.*/m,cdata:{pattern:/(\\begin\{((?:verbatim|lstlisting)\*?)\})([\w\W]*?)(?=\\end\{\2\})/,lookbehind:!0},equation:[{pattern:/\$(?:\\?[\w\W])*?\$|\\\((?:\\?[\w\W])*?\\\)|\\\[(?:\\?[\w\W])*?\\\]/,inside:n,alias:"string"},{pattern:/(\\begin\{((?:equation|math|eqnarray|align|multline|gather)\*?)\})([\w\W]*?)(?=\\end\{\2\})/,lookbehind:!0,inside:n,alias:"string"}],keyword:{pattern:/(\\(?:begin|end|ref|cite|label|usepackage|documentclass)(?:\[[^\]]+\])?\{)[^}]+(?=\})/,lookbehind:!0},url:{pattern:/(\\url\{)[^}]+(?=\})/,lookbehind:!0},headline:{pattern:/(\\(?:part|chapter|section|subsection|frametitle|subsubsection|paragraph|subparagraph|subsubparagraph|subsubsubparagraph)\*?(?:\[[^\]]+\])?\{)[^}]+(?=\}(?:\[[^\]]+\])?)/,lookbehind:!0,alias:"class-name"},"function":{pattern:e,alias:"selector"},punctuation:/[[\]{}&]/}}(Prism);
Prism.languages.markdown=Prism.languages.extend("markup",{}),Prism.languages.insertBefore("markdown","prolog",{blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},code:[{pattern:/^(?: {4}|\t).+/m,alias:"keyword"},{pattern:/``.+?``|`[^`\n]+`/,alias:"keyword"}],title:[{pattern:/\w+.*(?:\r?\n|\r)(?:==+|--+)/,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#+.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^\*\*|^__|\*\*$|__$/}},italic:{pattern:/(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*_]|[*_]$/}},url:{pattern:/!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,inside:{variable:{pattern:/(!?\[)[^\]]+(?=\]$)/,lookbehind:!0},string:{pattern:/"(?:\\.|[^"\\])*"(?=\)$)/}}}}),Prism.languages.markdown.bold.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.italic.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.bold.inside.italic=Prism.util.clone(Prism.languages.markdown.italic),Prism.languages.markdown.italic.inside.bold=Prism.util.clone(Prism.languages.markdown.bold);
Prism.languages.objectivec=Prism.languages.extend("c",{keyword:/\b(asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|in|self|super)\b|(@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/,string:/("|')(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|@"(\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,operator:/-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/});
Prism.languages.php=Prism.languages.extend("clike",{keyword:/\b(and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|private|protected|parent|throw|null|echo|print|trait|namespace|final|yield|goto|instanceof|finally|try|catch)\b/i,constant:/\b[A-Z0-9_]{2,}\b/,comment:{pattern:/(^|[^\\])(?:\/\*[\w\W]*?\*\/|\/\/.*)/,lookbehind:!0}}),Prism.languages.insertBefore("php","class-name",{"shell-comment":{pattern:/(^|[^\\])#.*/,lookbehind:!0,alias:"comment"}}),Prism.languages.insertBefore("php","keyword",{delimiter:/\?>|<\?(?:php)?/i,variable:/\$\w+\b/i,"package":{pattern:/(\\|namespace\s+|use\s+)[\w\\]+/,lookbehind:!0,inside:{punctuation:/\\/}}}),Prism.languages.insertBefore("php","operator",{property:{pattern:/(->)[\w]+/,lookbehind:!0}}),Prism.languages.markup&&(Prism.hooks.add("before-highlight",function(e){"php"===e.language&&(e.tokenStack=[],e.backupCode=e.code,e.code=e.code.replace(/(?:<\?php|<\?)[\w\W]*?(?:\?>)/gi,function(a){return e.tokenStack.push(a),"{{{PHP"+e.tokenStack.length+"}}}"}))}),Prism.hooks.add("before-insert",function(e){"php"===e.language&&(e.code=e.backupCode,delete e.backupCode)}),Prism.hooks.add("after-highlight",function(e){if("php"===e.language){for(var a,n=0;a=e.tokenStack[n];n++)e.highlightedCode=e.highlightedCode.replace("{{{PHP"+(n+1)+"}}}",Prism.highlight(a,e.grammar,"php").replace(/\$/g,"$$$$"));e.element.innerHTML=e.highlightedCode}}),Prism.hooks.add("wrap",function(e){"php"===e.language&&"markup"===e.type&&(e.content=e.content.replace(/(\{\{\{PHP[0-9]+\}\}\})/g,'<span class="token php">$1</span>'))}),Prism.languages.insertBefore("php","comment",{markup:{pattern:/<[^?]\/?(.*?)>/,inside:Prism.languages.markup},php:/\{\{\{PHP[0-9]+\}\}\}/}));
Prism.languages.python={"triple-quoted-string":{pattern:/"""[\s\S]+?"""|'''[\s\S]+?'''/,alias:"string"},comment:{pattern:/(^|[^\\])#.*/,lookbehind:!0},string:/("|')(?:\\?.)*?\1/,"function":{pattern:/((?:^|\s)def[ \t]+)[a-zA-Z_][a-zA-Z0-9_]*(?=\()/g,lookbehind:!0},"class-name":{pattern:/(\bclass\s+)[a-z0-9_]+/i,lookbehind:!0},keyword:/\b(?:as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|pass|print|raise|return|try|while|with|yield)\b/,"boolean":/\b(?:True|False)\b/,number:/\b-?(?:0[bo])?(?:(?:\d|0x[\da-f])[\da-f]*\.?\d*|\.\d+)(?:e[+-]?\d+)?j?\b/i,operator:/[-+%=]=?|!=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]|\b(?:or|and|not)\b/,punctuation:/[{}[\];(),.:]/};
Prism.languages.sql={comment:{pattern:/(^|[^\\])(?:\/\*[\w\W]*?\*\/|(?:--|\/\/|#).*)/,lookbehind:!0},string:{pattern:/(^|[^@\\])("|')(?:\\?[\s\S])*?\2/,lookbehind:!0},variable:/@[\w.$]+|@("|'|`)(?:\\?[\s\S])+?\1/,"function":/\b(?:COUNT|SUM|AVG|MIN|MAX|FIRST|LAST|UCASE|LCASE|MID|LEN|ROUND|NOW|FORMAT)(?=\s*\()/i,keyword:/\b(?:ACTION|ADD|AFTER|ALGORITHM|ALL|ALTER|ANALYZE|ANY|APPLY|AS|ASC|AUTHORIZATION|BACKUP|BDB|BEGIN|BERKELEYDB|BIGINT|BINARY|BIT|BLOB|BOOL|BOOLEAN|BREAK|BROWSE|BTREE|BULK|BY|CALL|CASCADED?|CASE|CHAIN|CHAR VARYING|CHARACTER (?:SET|VARYING)|CHARSET|CHECK|CHECKPOINT|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMN|COLUMNS|COMMENT|COMMIT|COMMITTED|COMPUTE|CONNECT|CONSISTENT|CONSTRAINT|CONTAINS|CONTAINSTABLE|CONTINUE|CONVERT|CREATE|CROSS|CURRENT(?:_DATE|_TIME|_TIMESTAMP|_USER)?|CURSOR|DATA(?:BASES?)?|DATETIME|DBCC|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DEFINER|DELAYED|DELETE|DENY|DESC|DESCRIBE|DETERMINISTIC|DISABLE|DISCARD|DISK|DISTINCT|DISTINCTROW|DISTRIBUTED|DO|DOUBLE(?: PRECISION)?|DROP|DUMMY|DUMP(?:FILE)?|DUPLICATE KEY|ELSE|ENABLE|ENCLOSED BY|END|ENGINE|ENUM|ERRLVL|ERRORS|ESCAPE(?:D BY)?|EXCEPT|EXEC(?:UTE)?|EXISTS|EXIT|EXPLAIN|EXTENDED|FETCH|FIELDS|FILE|FILLFACTOR|FIRST|FIXED|FLOAT|FOLLOWING|FOR(?: EACH ROW)?|FORCE|FOREIGN|FREETEXT(?:TABLE)?|FROM|FULL|FUNCTION|GEOMETRY(?:COLLECTION)?|GLOBAL|GOTO|GRANT|GROUP|HANDLER|HASH|HAVING|HOLDLOCK|IDENTITY(?:_INSERT|COL)?|IF|IGNORE|IMPORT|INDEX|INFILE|INNER|INNODB|INOUT|INSERT|INT|INTEGER|INTERSECT|INTO|INVOKER|ISOLATION LEVEL|JOIN|KEYS?|KILL|LANGUAGE SQL|LAST|LEFT|LIMIT|LINENO|LINES|LINESTRING|LOAD|LOCAL|LOCK|LONG(?:BLOB|TEXT)|MATCH(?:ED)?|MEDIUM(?:BLOB|INT|TEXT)|MERGE|MIDDLEINT|MODIFIES SQL DATA|MODIFY|MULTI(?:LINESTRING|POINT|POLYGON)|NATIONAL(?: CHAR VARYING| CHARACTER(?: VARYING)?| VARCHAR)?|NATURAL|NCHAR(?: VARCHAR)?|NEXT|NO(?: SQL|CHECK|CYCLE)?|NONCLUSTERED|NULLIF|NUMERIC|OFF?|OFFSETS?|ON|OPEN(?:DATASOURCE|QUERY|ROWSET)?|OPTIMIZE|OPTION(?:ALLY)?|ORDER|OUT(?:ER|FILE)?|OVER|PARTIAL|PARTITION|PERCENT|PIVOT|PLAN|POINT|POLYGON|PRECEDING|PRECISION|PREV|PRIMARY|PRINT|PRIVILEGES|PROC(?:EDURE)?|PUBLIC|PURGE|QUICK|RAISERROR|READ(?:S SQL DATA|TEXT)?|REAL|RECONFIGURE|REFERENCES|RELEASE|RENAME|REPEATABLE|REPLICATION|REQUIRE|RESTORE|RESTRICT|RETURNS?|REVOKE|RIGHT|ROLLBACK|ROUTINE|ROW(?:COUNT|GUIDCOL|S)?|RTREE|RULE|SAVE(?:POINT)?|SCHEMA|SELECT|SERIAL(?:IZABLE)?|SESSION(?:_USER)?|SET(?:USER)?|SHARE MODE|SHOW|SHUTDOWN|SIMPLE|SMALLINT|SNAPSHOT|SOME|SONAME|START(?:ING BY)?|STATISTICS|STATUS|STRIPED|SYSTEM_USER|TABLES?|TABLESPACE|TEMP(?:ORARY|TABLE)?|TERMINATED BY|TEXT(?:SIZE)?|THEN|TIMESTAMP|TINY(?:BLOB|INT|TEXT)|TOP?|TRAN(?:SACTIONS?)?|TRIGGER|TRUNCATE|TSEQUAL|TYPES?|UNBOUNDED|UNCOMMITTED|UNDEFINED|UNION|UNIQUE|UNPIVOT|UPDATE(?:TEXT)?|USAGE|USE|USER|USING|VALUES?|VAR(?:BINARY|CHAR|CHARACTER|YING)|VIEW|WAITFOR|WARNINGS|WHEN|WHERE|WHILE|WITH(?: ROLLUP|IN)?|WORK|WRITE(?:TEXT)?)\b/i,"boolean":/\b(?:TRUE|FALSE|NULL)\b/i,number:/\b-?(?:0x)?\d*\.?[\da-f]+\b/,operator:/[-+*\/=%^~]|&&?|\|?\||!=?|<(?:=>?|<|>)?|>[>=]?|\b(?:AND|BETWEEN|IN|LIKE|NOT|OR|IS|DIV|REGEXP|RLIKE|SOUNDS LIKE|XOR)\b/i,punctuation:/[;[\]()`,.]/};
!function(){"undefined"!=typeof self&&self.Prism&&self.document&&Prism.hooks.add("complete",function(e){if(e.code){var t=e.element.parentNode,s=/\s*\bline-numbers\b\s*/;if(t&&/pre/i.test(t.nodeName)&&(s.test(t.className)||s.test(e.element.className))&&!e.element.querySelector(".line-numbers-rows")){s.test(e.element.className)&&(e.element.className=e.element.className.replace(s,"")),s.test(t.className)||(t.className+=" line-numbers");var n,a=e.code.match(/\n(?!$)/g),l=a?a.length+1:1,m=new Array(l+1);m=m.join("<span></span>"),n=document.createElement("span"),n.className="line-numbers-rows",n.innerHTML=m,t.hasAttribute("data-start")&&(t.style.counterReset="linenumber "+(parseInt(t.getAttribute("data-start"),10)-1)),e.element.appendChild(n)}}})}();
// ajout style PRISM
GM_addStyle('pre.line-numbers,pre.line-numbers>code{position:relative}code[class*=language-],pre[class*=language-]{color:#000;font-family:Consolas,Monaco,"Andale Mono","Ubuntu Mono",monospace;direction:ltr;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}code[class*=language-] ::-moz-selection,code[class*=language-]::-moz-selection,pre[class*=language-] ::-moz-selection,pre[class*=language-]::-moz-selection{text-shadow:none;background:#b3d4fc}code[class*=language-] ::selection,code[class*=language-]::selection,pre[class*=language-] ::selection,pre[class*=language-]::selection{text-shadow:none;background:#b3d4fc}@media print{code[class*=language-],pre[class*=language-]{text-shadow:none}}pre[class*=language-]{padding:1em;margin:0;overflow:auto}:not(pre)>code[class*=language-],pre[class*=language-]{background:#f5f2f0}:not(pre)>code[class*=language-]{padding:.1em;border-radius:.3em;white-space:normal}.token.cdata,.token.comment,.token.doctype,.token.prolog{color:#708090}.token.punctuation{color:#999}.namespace{opacity:.7}.token.boolean,.token.constant,.token.deleted,.token.number,.token.property,.token.symbol,.token.tag{color:#905}.token.attr-name,.token.builtin,.token.char,.token.inserted,.token.selector,.token.string{color:#690}.language-css .token.string,.style .token.string,.token.entity,.token.operator,.token.url{color:#BF7F3F}.token.atrule,.token.attr-value,.token.keyword{color:#07a}.token.function{color:#DD4A68}.token.important,.token.regex,.token.variable{color:#e90}.token.bold,.token.important{font-weight:700}.token.italic{font-style:italic}.token.entity{cursor:help}pre.line-numbers{padding-left:3.8em;counter-reset:linenumber}.line-numbers .line-numbers-rows{position:absolute;pointer-events:none;top:0;font-size:100%;left:-3.8em;width:3em;letter-spacing:-1px;border-right:1px solid #999;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.line-numbers-rows>span{pointer-events:none;display:block;counter-increment:linenumber}.line-numbers-rows>span:before{content:counter(linenumber);color:#999;display:block;padding-right:.8em;text-align:right}');
var rightArrowSVGURI = 'data:image/svg+xml;charset=utf-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNDQuMjM2cHgiIGhlaWdodD0iNDQuMjM2cHgiIHZpZXdCb3g9IjAgMCA0NC4yMzYgNDQuMjM2IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBmaWxsPSIjY2NjY2NjIiBkPSJNMjIuMTE4LDQ0LjIzNkM5LjkyMiw0NC4yMzYsMCwzNC4zMTQsMCwyMi4xMThTOS45MjIsMCwyMi4xMTgsMHMyMi4xMTgsOS45MjIsMjIuMTE4LDIyLjExOFMzNC4zMTQsNDQuMjM2LDIyLjExOCw0NC4yMzZ6IE0yMi4xMTgsMS41QzEwLjc1LDEuNSwxLjUsMTAuNzQ5LDEuNSwyMi4xMThjMCwxMS4zNjgsOS4yNSwyMC42MTgsMjAuNjE4LDIwLjYxOGMxMS4zNywwLDIwLjYxOC05LjI1LDIwLjYxOC0yMC42MThDNDIuNzM2LDEwLjc0OSwzMy40ODgsMS41LDIyLjExOCwxLjV6Ii8+PHBhdGggZmlsbD0iI2NjY2NjYyIgZD0iTTE5LjM0MSwyOS44ODRjLTAuMTkyLDAtMC4zODQtMC4wNzMtMC41My0wLjIyYy0wLjI5My0wLjI5Mi0wLjI5My0wLjc2OCwwLTEuMDYxbDYuNzk2LTYuODA0bC02Ljc5Ni02LjgwM2MtMC4yOTItMC4yOTMtMC4yOTItMC43NjksMC0xLjA2MWMwLjI5My0wLjI5MywwLjc2OC0wLjI5MywxLjA2MSwwbDcuMzI1LDcuMzMzYzAuMjkzLDAuMjkzLDAuMjkzLDAuNzY4LDAsMS4wNjFsLTcuMzI1LDcuMzMzQzE5LjcyNSwyOS44MTEsMTkuNTMzLDI5Ljg4NCwxOS4zNDEsMjkuODg0eiIvPjwvZz48L3N2Zz4=';
