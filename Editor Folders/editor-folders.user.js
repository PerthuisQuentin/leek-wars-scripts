// ==UserScript==
// @name		  [Leek Wars] Editor Folders
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

/*
	Fonctionnement : 
		Nom des fichiers => création des dossiers
		Séparateur de nom de fichier => /
		Dossiers vides stockées dans le localStorage
	Modifications à apporter : 
		Sidebar : 
			Collée à droite à l'éditeur
			Redimensionnable (avec l'éditeur donc)
			Couleur : celle de l'éditeur -42 si thème monokaï, ou +42 si pas monokaï ((color < 128) ? +42 : -42)
		Refresh : 
			Permettre toutes les opérations banales (suppression de dossier / fichier, création, sauvegarde) sans refresh la page
		Thèmes : 
			Permettre de selectionner le thème de la sidebar (clair ou foncé), les calculs seront fait en simulant la présence du thème accordé (monokai ou clair de leekwars)
		Arborescence : 
			Les dossiers ouverts dans la sidebar sont sauvés dans le localStorage
			Ajout des dossiers
				Fermés de base
				Texte de couleur : ((color < 128) ? +100 : -100)
				Petite flèche sur la gauche indiquant le fait que le dossier est ouvert ou fermé
				Au clic droit sur un dossier, il est possible de :
					- le renommer : le dossier devient un input modifiable. Lors de l'entrée de la touche entrée, le nom est sauvegardé. Infobulle en cas d'utilisation du /
					- le supprimer : affiche une demande de confirmation, puis supprime le dossier et tout ce qu'il contient
					- Créer un dossier : permet de créer un nouveau dossier dans ce dossier. Cela crée le dossier, puis appelle la fonction de renommage automatiquement avec comme nom 'Nouveau dossier'
					- Créer un fichier : même chose que pour la création de fichier, mais le fichier créé devient en plus actif
				Possibilité de drag n drop un dossier sur un autre dossier. Il sera alors ajouté à l'intérieur de ce dernier
			Ajout des fichiers
				Icone d'accolade de brackets
				Texte de couleur noire ou blanche en fonction du thème, ou rouge (213, 30, 30) si le fichier est erroné
				Au clic droit sur un fichier, il est possible de : 
					- le renommer : same as dossier
					- Le supprimer : same as dossier
					- Créer un dossier : permet de créer un dossier dans le même repertoire que le fichier
					- Créer un fichier : permet de créer un fichier dans le même repertoire que le fichier
				Le format du fichier est plus sombre afin de ne pas gêner la visualisation du nom réel (format de la même couleur que les dossiers)
				Fichier actif : 
					devient bleu (ou rouge si erroné), le background devient plus sombre (à cheval entre le thème de l'editeur et de la sidebar)
					en bas de la sidebar sont affiché l'état du fichier (nombre de lignes, de caractères, le niveau, sa justesse)
				Possibilité de drag n drop un fichier vers un autre dossier
		Contrôles : 
			Créer un fichier : Utilisation du clic droit. Disparition de la barre du haut (ou pas, à voir)
			Supprimer un fichier : idem
			Sauvegarder : passage à une icone
			Tester : On le laisse, trouver un design qui convient
			Options : On le laisse
			Aide : On le laisse
		Debugguer : 
			Supprimer les affichages dans verts qui gênent la vue, et ajout d'une box en bas de l'écran, redimensionnable qui affiche ces messages
			Ajout de la coloration dyntaxique sur les messages afin de renforcer les choses importantes et augmenter la lisibilité
		Import/export : Possibilité d'exporter un fichier ou un dossier : 
			Import d'un fichier seul : Possibilité de drag n drop depuis l'explorateur sur le directory dans laquelle on veut le copier. Ou clic droit sur la directory ou un fichier puis 'Importer'
			Export d'un seul fichier : Clic droit sur un fichier: 'Exporter', permet à l'utilisateur de sauvegarder le fichier
			Import de plusieurs fichiers : Possibilité de drag&drop ou clic droit : 'Importer'
			Export de plusieurs fichiers : (pour les selectionner, soit un dossier entier, soit hold CTRL + click), puis création d'un .zip et sauvegarde
			Import d'un zip : Via drag&drop ou 'Import', puis extraction et création

		Lors de toute opération longue, un loader est affiché

		Format : 
			2 élements importants : 
				le design
				la partie en mémoire

			Un gros objet en mémoire contient l'intégralité de l'arborescence de fichiers ainsi que des accesseurs
			Chaque objet comporte un lien vers sa version dans le design
				API : 
					root.gen() // génère la sidebar

					item.create('folder|file', name, content)
					item.delete()
					item.save()
					item.addToBuffer() (pour l'export de plusieurs fichiers)
					folder.open() // update l'interface pour ouvrir le fichier
					folder.close()
					file.setValid(true|false) // modifie le design pour indiquer si le fichier est erroné ou non
					file.export() // permet de sauvegarder le fichier
					item.import() // importe un fichier dans 

*/
 
//(function() {
	var root = {
		folders: {},
		files: {}, // les files contiennent {name, parent, lvl, lines, chars, valid, id}
		parent: null,
		name: '',
	};

	function formatPath(path) {
		if(typeof path === 'object') return path;
		else { // ça devrait être une string... Sinon, fuck it, ça crashe...
			var tmp = path.split('/');
			path = [];
			for(var i = 0; i < tmp.length; ++i) {
				if(tmp[i] != '') path.push(tmp[i]);
			}
			return path;
		}
	}

	function pathToString(path) {
		path = formatPath(path);
		var str = '';
		for(var i = 0; i < path.length; ++i) {
			str += path[i] + ((i !== path.length - 1) ? '/' : '');
		}
		return str;
	}

	function cutDirFile(name) { // coupe 'folder/folder/file' en {dirname: ['folder', 'folder'], filename: 'file' 
		var index = name.lastIndexOf('/');
		var ret = {
			dirname: [],
			filename: ''
		}
		if(index === -1) {
			ret.filename = name;
			return ret;
		}
		else {
			var tmp = name.split('/');
			for(var i = 0; i < tmp.length - 1; ++i) {
				ret.dirname.push(tmp[i]);
			}
			ret.filename = tmp[tmp.length - 1];
			return ret;
		}
	}

	var storage = {
		init: function() {
			if(localStorage.getItem('EF.data') === null) localStorage.setItem('EF.data', JSON.stringify({emptyFolders:[],expandedFolders:[]}));
		},
		get: function() {
			return JSON.parse(localStorage.getItem('EF.data'));
		},
		set: function(data) {
			localStorage.setItem('EF.data', JSON.stringify(data));
		},
		emptyFolders: function(folder, status) {
			if(status !== undefined) {
				var data = storage.get();
				var index = data.emptyFolders.indexOf(folder);
				if(index === -1 && status) data.emptyFolders.push(folder);
				if(index !== -1 && !status) data.emptyFolders.splice(index, 1);
				storage.set(data);
				return data.emptyFolders;
			}
			return storage.get().emptyFolders;
		},
		getExpandedFolders: function(folder, status) {
			if(status !== undefined) {
				var data = storage.get();
				var index = data.expandedFolders.indexOf(folder);
				if(index === -1 && status) data.expandedFolders.push(folder);
				if(index !== -1 && !stats) data.expandedFolders.splice(index, 1);
				storage.set(data);
				return data.expandedFolders;
			}
			return storage.get().expandedFolders;
		},
		changeName: function(oldName, newName) {
			var data = storage.get();
			var index = data.emptyFolders.indexOf(oldName);
			if(index !== -1) {
				data.emptyFolders.splice(index, 1);
				data.emptyFolders.push(newName);
			}
			index = data.expandedFolders.indexOf(oldName);
			if(index !== -1) {
				data.expandedFolders.splice(index, 1);
				data.expandedFolders.push(newName);
			}
			storage.set(data);
		}
	};

	var local = {
		init: function(callback) {
			_.get('ai/get-farmer-ais/$', function(data) {
				if(data.success) {
					for(var i = 0; i < data.ais.length; ++i) {
						var tmp = cutDirFile(data.ais[i].name);
						local.mkdir(root, tmp.dirname);
						local.addFile(root, tmp.dirname, {
							name: tmp.filename,
							lvl: data.ais[i].level,
							valid: data.ais[i].valid,
							lines: 0,
							chars: 0,
							id: data.ais[i].id
						});
					}
					callback();
				}
			});
		},
		getPath: function(dir) {
			var path = '';
			while(dir.parent !== null) {
				path = dir.name + '/' + path;
				dir = dir.parent;
			}
			return path;
		},
		isChildrenOfDir: function(dir, toDir) {
			if(toDir.parent === null) return true;
			while(dir.parent !== null) {
				if(dir.parent === toDir) return true;
				dir = dir.parent;
			}
			return false;
		},
		cd: function(root, path) {
			for(var i = 0; i < path.length; ++i) {
				root = root.folders[path[i]];
			}
			return root;
		},
		mkdir: function(root, dir) {
			for(var i = 0; i < dir.length; ++i) {
				if(!root.folders[dir[i]]) {
					root.folders[dir[i]] = {
						folders: {},
						files: {},
						parent: root,
						name: dir[i],
					};
					// c'est qu'il est vide
					storage.emptyFolders(local.getPath(root.folders[dir[i]]), true);
				}
				root = root.folders[dir[i]];
			}
		},
		addFile: function(root, path, data) {
			var dir = local.cd(root, path);
			storage.emptyFolders(local.getPath(dir), false);
			dir.files[data.name] = {
				name: data.name,
				lvl: data.lvl,
				valid: data.valid,
				parent: dir,
				lines: data.lines,
				chars: data.chars,
				id: data.id
			};
		},
		removeFile: function(root, path, name) {
			var dir = local.cd(root, path);
			if(Object.keys(dir.files).length === 1) {
				storage.emptyFolders(local.getPath(dir), true);
			}
			delete dir.files[name];
		},
		removeDir: function(root, path) {
			var dir = local.cd(root, path).parent;
			delete dir.folders[path[path.length - 1]];
		},
		moveFile: function(originRoot, originPath, destiRoot, destiPath, name) {
			var dir = local.cd(originRoot, originPath);
			var toDir = local.cd(destiRoot, destiPath);
			if(toDir.files[name]) return false; // déja un fichier de ce nom dans cette directory
			var file = {};
			Object.keys(dir.files[name]).forEach(function(index, item) {
				if(index !== 'parent') file[index] = dir.files[name][index];
			});
			local.addFile(destiRoot, destiPath, file);
			local.removeFile(originRoot, originPath, name);
			return true;
		},
		moveDir: function(originRoot, originPath, destiRoot, destiPath) {
			var dir = local.cd(originRoot, originPath);
			var toDir = local.cd(destiRoot, destiPath);
			if(local.isChildrenOfDir(dir, toDir) || toDir.folders[dir.name]) return false;			
			destiPath.push(originPath[originPath.length - 1]);
			toDir = local.cd(destiRoot, destiPath);
			local.mkdir(destiRoot, destiPath);
			Object.keys(dir.files).forEach(function(index, item) {
				local.moveFile(originRoot, originPath, destiRoot, destiPath, dir.files[index].name);
			});
			originPath.push('');
			Object.keys(dir.folders).forEach(function(index, item) {
				originPath[originPath.length - 1] = index;
				local.moveDir(originRoot, originPath, destiRoot, destiPath);
			});
			originPath.splice(originPath.length - 1, 1);
			local.removeDir(originRoot, originPath);
			return true;
		},
		renameFile: function(root, path, name, newName) {
			var dir = local.cd(root, path);
			if(dir.files[name]) {
				dir.files[newName] = dir.files[name];
				dir.files[newName].name = newName;
				delete dir.files[name];
			}
		},
		renameDir: function(root, path, newName) {
			var dir = local.cd(root, path).parent;
			if(dir !== null) {
				dir.folders[newName] = dir.folders[path[path.length - 1]];
				dir.folders[newName].name = newName;

				Object.keys(dir.folders[newName].folders).forEach(function(index, item) {
					dir.folders[newName].folders[index].parent = dir.folders[newName];
				}); 

				Object.keys(dir.folders[newName].files).forEach(function(index, item) {
					dir.folders[newName].files[index].parent = dir.folders[newName];
				});

				delete dir.folders[path[path.length - 1]];
			}
		}
	};

	var design = {
		data: {
			sidebar: undefined,
			sdb: undefined,
			resizer: undefined,
			content: undefined,
			header: undefined,
			iaList: undefined,

			svg: {
				folderFolded: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%22401px%22%20height%3D%22401px%22%20viewBox%3D%220%200%20401%20401%22%3E%3Cpolygon%20fill%3D%22%23%color%%22%20points%3D%22100%2C27%20401%2C201%20100%2C374%22%2F%3E%3C%2Fsvg%3E',
				folderOpened: 'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%22401px%22%20height%3D%22401px%22%20viewBox%3D%220%200%20401%20401%22%3E%3Cpolygon%20fill%3D%22%23%color%%22%20points%3D%22374%2C100%20201%2C401%2027%2C100%22%2F%3E%3C%2Fsvg%3E',

			}
		},
		init: function() {
			initCall();

			var sdb = {
				width: 0,
				mouseOrigin: 0,
				left: 0,
				moving: false
			};

			var sidebar = $('#editor-page .column2').unbind().css({
				'margin-right': 0,
				'background': design.getColor('sidebar'),
				'height': $('#editor-page .column10').outerHeight() - 15 + 'px',
				'padding-top': '1em',
				'box-sizing': 'border-box',
				'font-size': '1.1em',
				'font-family': 'Lucida Sans Unicode', // ouaip, toi aussi inclu Roboto quand t'as lucida qui fait la même chose
				'text-overflow': 'hidden',
			}).html('');

			sdb.width = sidebar.outerWidth();
			sdb.left = sidebar.offset().left;

			var resizer = $(document.createElement('div')).css({
				width: '6px',
				height: '100%',
				'float': 'right',
				'cursor': 'col-resize'
			}).on('mousedown', function(e) {
				sdb.moving = true;
				sdb.mouseOrigin = e.pageX;
			}).appendTo(sidebar);

			$(document).on('mouseup', function(e) {
				sdb.moving = false;
				sdb.width = sidebar.outerWidth();
			});

			$(document).on('mousemove', function(e) {
				if(sdb.moving && (sdb.width + (e.pageX - sdb.mouseOrigin)) < 0.9*(($('#editor-page .container').outerWidth() - 15)) && (sdb.width + (e.pageX - sdb.mouseOrigin)) > 50) {
					$('#editor-page .column10').css('width', 'calc(100% - ' + (sdb.width + (e.pageX - sdb.mouseOrigin)) + 'px)');
					sidebar.css('width', sdb.width + (e.pageX - sdb.mouseOrigin) + 'px');
					e.preventDefault();
				}
			});

			var content = $(document.createElement('div')).css({
				height: '100%'
			}).appendTo(sidebar);

			var header = $(document.createElement('div')).appendTo(content);
			var iaList = $(document.createElement('div')).appendTo(content);

			// POURQUOI LA COULEUR DE FOND NE VEUT PAS SE METTRE BORDEL !!!!!!!
			setTimeout(function() {
				sidebar.css('height', $('#editor-page .column10').outerHeight() - 15 + 'px');
			}, 500);

			$(window).resize(function() {
				sidebar.css('height', $('#editor-page .column10').outerHeight() - 15 + 'px');
				sdb.width = sidebar.outerWidth();
				sdb.left = sidebar.offset().left;
			});

			// ajout du design
			content.attr('id', 'ef-ai-').css({
				'text-overflow': 'clip',
				'overflow': 'hidden',
				'cursor': 'default'
			});

			design.setUnselectable(sidebar);

			design.gen();

			data.sidebar = sidebar;
			data.sdb = sdb;
			data.resizer = resizer;
			data.content = content;
			data.header = header;
			data.iaList = iaList;

		},
		getColor: function(item) {
			var darkTheme = true;// localStorage['editor/theme'] === 'theme-monokai';
			switch(item) {
				case 'sidebar': return darkTheme ? 'rgb(61, 62, 56)' : 'rgb(190, 190, 190)';
				case 'folder-text': return darkTheme ? 'rgb(180, 180, 200)' : 'rgb(70, 70, 70)';
				case 'file-text': return darkTheme ? 'rgb(210, 210, 210)' : 'rgb(45, 45, 45)';
				case 'file-text-wrong': return darkTheme ? 'rgb(230, 30, 30)': 'rgb(230, 30, 30)';
			}
		},
		gen: function() {
			design.genSubFolder(root, 1);
		},
		getCSSPath: function(dir) {
			return 'ef-ai-' + pathToString(local.getPath(dir)).replace(/\//g, '-').replace(/ /g, '-'); // #securité ^^
		},
		getDir: function(dir) {
			return $('#' + design.getCSSPath(dir) + ((dir.parent === null) ? '' : ' .ef-content')).first();
		},
		genSubFolder: function(root, indent) {
			Object.keys(root.folders).forEach(function(index, item) {
				(function() {
					var current = $(document.createElement('div')).css({'white-space': 'nowrap'}).addClass('ef-folder').
					attr('data-folded', 'true').
					attr('data-name', root.folders[index].name).
					attr('id', design.getCSSPath(root.folders[index])).appendTo(design.getDir(root));
					var icon = $(document.createElement('div')).addClass('ef-icon').css({
						background: 'url(\'' + design.colorSVG(design.data.svg.folderFolded, 'b4b4c8') + '\')',
						display: 'inline-block',
						width: '0.7em',
						height: '0.7em',
						'margin-right': '7px',
						'background-size': 'cover',
						'margin-left': 'calc(' + (indent*0.7) + 'em' + ' + ' + (indent*7) + 'px)',
					}).click(function() {
						design.toggleFold(current);
					}).appendTo(current);
					var name = $(document.createElement('div')).text(root.folders[index].name).css({
						color: design.getColor('folder-text'),
						'text-shadow': '1px 1px 1px black',
						'display': 'inline-block',
						'margin': '2px',
					}).click(function() {						
						design.toggleFold(current);
					}).addClass('ef-name').appendTo(current);
					var subDir = $(document.createElement('div')).css({
						//'padding-left': '1em',
					}).addClass('ef-content').appendTo(current);
					design.genSubFolder(root.folders[index], indent + 1);
					subDir.stop(true, false).slideUp(0);
				})();
			});

			Object.keys(root.files).forEach(function(index, item) {
				(function() {
					var current = $(document.createElement('div')).css({'white-space': 'nowrap', 'border-sizing': 'border-box'}).addClass('ef-file').
					attr('data-name', root.files[index].name).
					attr('data-id', root.files[index].id).
					attr('id', design.getCSSPath(root.files[index].parent)+'-'+root.files[index].name).
					click(function() {
						// on enlève le select des autres
						$('.ef-file').css({
							'background-color': 'transparent',
						});
						$('.ef-file-name').css('color', design.getColor('file-text'));

						$(this).css({
							'background-color': 'rgb(35, 35, 35)'
						});
						name.css('color', 'rgb(120, 200, 255)');
						LW.page('/editor/' + current.attr('data-id'));
					}).
					appendTo(design.getDir(root));
					var icon = $(document.createElement('div')).addClass('ef-icon').css({
						background: 'url(\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20id%3D%22Capa_1%22%20x%3D%220px%22%20y%3D%220px%22%20viewBox%3D%220%200%20307.454%20307.454%22%20style%3D%22enable-background%3Anew%200%200%20307.454%20307.454%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23b4b4c8%22%20d%3D%22M241.19%20200.541c0%202.691-2.201%204.895-4.893%204.895H71.158c-2.693%200-4.895-2.203-4.895-4.895v-3.261%20c0-2.691%202.201-4.894%204.895-4.894h165.139c2.691%200%204.9%202.2%204.9%204.894L241.19%20200.541L241.19%20200.541z%22%2F%3E%3Cpath%20fill%3D%22%23b4b4c8%22%20d%3D%22M140.219%2064.99c0%202.69-2.201%204.893-4.895%204.893H71.158c-2.693%200-4.895-2.202-4.895-4.893v-3.263%20c0-2.691%202.201-4.894%204.895-4.894h64.166c2.693%200%204.9%202.2%204.9%204.894V64.99z%22%2F%3E%3Cpath%20fill%3D%22%23b4b4c8%22%20d%3D%22M238.713%20245.727c0%202.69-2.203%204.892-4.897%204.892H169.65c-2.693%200-4.895-2.202-4.895-4.892v-3.263%20c0-2.691%202.201-4.894%204.895-4.894h64.166c2.693%200%204.9%202.2%204.9%204.894V245.727z%22%2F%3E%3Cpath%20fill%3D%22%23b4b4c8%22%20d%3D%22M174.238%20110.172c0%202.691-2.201%204.895-4.893%204.895H71.157c-2.693%200-4.895-2.203-4.895-4.895v-3.261%20c0-2.691%202.201-4.893%204.895-4.893h98.188c2.691%200%204.9%202.2%204.9%204.893V110.172z%22%2F%3E%3Cpath%20fill%3D%22%23b4b4c8%22%20d%3D%22M241.19%20155.357c0%202.691-2.201%204.893-4.893%204.893H71.158c-2.693%200-4.895-2.202-4.895-4.893v-3.262%20c0-2.691%202.201-4.894%204.895-4.894h165.139c2.691%200%204.9%202.2%204.9%204.894L241.19%20155.357L241.19%20155.357z%22%2F%3E%3Cpath%20fill%3D%22%23b4b4c8%22%20d%3D%22M272.401%2074.521L193.278%209.454C186.727%204.1%20175.4%200%20166.9%200H42.442c-10.76%200-19.516%208.754-19.516%2019.5%20c0%200%200%20210%200%20267.839c0%2020.1%2019%2020.1%2019.5%2020.099c48.34%200%20222.6%200%20222.6%200c10.762%200%2019.516-8.755%2019.516-19.517%20V100.198C284.528%2091.2%20279.3%2080.2%20272.4%2074.521z%20M187.867%2029.475c0-4.781%203.959-1.113%203.959-1.113l62.717%2053.6%20c0%200%204%203.949-2.865%203.949c-14.688%200-58.746%200-58.746%200c-2.793%200-5.065-2.271-5.065-5.064%20C187.867%2080.8%20187.9%2042.3%20187.9%2029.475z%20M265.012%20292.999c0%200-179.055%200-223.99%200c-0.801%200-3.643-0.229-3.643-4.182%20c0-54.407%200-269.302%200-269.302c0-2.745%202.32-5.063%205.063-5.063h124.464c2.107%200%206.5%201.1%206.5%207.138v59.242%20c0%2010.8%208.8%2019.5%2019.5%2019.516h73.523c1.342%200%203.6%200.9%203.6%204.169c0%200.1%200%20183.4%200%20183.4%20C270.076%20290.7%20267.8%20293%20265%20292.999z%22%2F%3E%3C%2Fsvg%3E',
						display: 'inline-block',
						width: '1em',
						height: '1em',
						'margin-right': '7px',
						'background-size': 'cover',
						'margin-left': 'calc(' + (indent*0.7) + 'em + ' + (indent*7) + 'px)'
					}).appendTo(current);
					var name = $(document.createElement('div')).text(root.files[index].name).css({
						color: (root.files[index].valid ? design.getColor('file-text') : design.getColor('file-text-wrong')),
						'text-shadow': '1px 1px 1px black',
						'display': 'inline-block',
						'margin': '2px',
					}).addClass('ef-file-name').appendTo(current);
				})();
			});
		},
		fold: function(item) {
			var icon = item.find('.ef-icon').first();
			icon.css({
				background: 'url(\'' + design.colorSVG(design.data.svg.folderFolded, 'b4b4c8') + '\')',
				'background-size': 'cover'
			});
			var content = item.find('.ef-content').first();
			content.stop(true, false).slideUp();
			item.attr('data-folded', true);
		},
		unfold: function(item) {
			var icon = item.find('.ef-icon').first();
			icon.css({
				background: 'url(\'' + design.colorSVG(design.data.svg.folderOpened, 'b4b4c8') + '\')',
				'background-size': 'cover'
			});
			var content = item.find('.ef-content').first();
			content.stop(true, false).slideDown();
			item.attr('data-folded', false);
		},
		toggleFold: function(item) {
			if(item.attr('data-folded') == 'true') design.unfold(item);
			else design.fold(item);
		},
		setUnselectable: function(element) {
			element.attr('unselectable','on')
     		.css({
				'-moz-user-select':'-moz-none',
				'-moz-user-select':'none',
				'-o-user-select':'none',
				'-khtml-user-select':'none', /* you could also put this in a class */
				'-webkit-user-select':'none',/* and add the CSS class here instead */
				'-ms-user-select':'none',
				'user-select':'none'
     		}).bind('selectstart', function(){ return false; });
		},
		colorSVG: function(svg, color) {
			return svg.replace(/\%color\%/g, color);
		},
		setFileValid: function(file, valid) {

		},
		regenColor: function() {
			
		}
	};

	function init() {
		if(LW.currentPage === undefined) {
			setTimeout(init, 100);
			return;
		}
		storage.init();
		local.init(design.init);
	}

	LW.on('pageload', function() {
		if(LW.currentPage === 'editor') init();
	});

//})();

function initCall() {
	local.mkdir(root, ['folder1', 'folder2']);
	local.mkdir(root, ['folder3']);
	local.mkdir(root, ['folder2']);
	local.addFile(root, ['folder1'], {
		name: 'Fichier_de_test',
		lvl: 15,
		valid: true,
		lines: 134,
		chars: 1230
	});

	local.addFile(root, ['folder1'], {
		name: 'Fichier_2',
		lvl: 15,
		valid: false,
		lines: 134,
		chars: 1230
	});

	local.addFile(root, ['folder3'], {
		name: 'Un_fichier',
		lvl: 15,
		valid: false,
		lines: 134,
		chars: 1230
	});
	local.moveFile(root, ['folder1'], root, ['folder1', 'folder2'], 'Fichier_2');
	local.moveDir(root, ['folder1'], root, ['folder3']);
	local.renameDir(root, ['folder3'], 'main-folder');
}


/*
_.get('ai/get-farmer-ais/$', function(data) {console.log(data.ais[0])})
undefined
Get : ai/get-farmer-ais/$ _.js:546:3
Res :  Object { success: true, ais: Array[5] } _.js:534:4
Object { id: 146826, name: "clafoutis", level: 38, valid: true }

Affichage :

[icone dossier] Nom_du_dossier
	[icone valid] Nom_du_fichier

Icone valid doit être une icone de fichier verte ou rouge, ou l'icone de base ?

{
	folder: [
		{
			name: 'libs',
			content: {
				folder: [],
				files: []
			}
		}
	],
	files: [{
		name: 'IA de test',
		id: 12345,
		valid: false,
		level: 38
	}]
}*/