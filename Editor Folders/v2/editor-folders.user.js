// ==UserScript==
// @name		  [Leek Wars] Editor Folders v2
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

//(function() {

	var theme = {
		'dark': {
			'sidebar' : { // barre à gauche de l'éditeur
				'margin-right': 0,
				'background': 'rgb(61,62,56)',
				'box-sizing': 'border-box',
				'font-size': '1.1em',
				'font-family': '"Lucida Sans Unicode", "Roboto"', // ouaip, toi aussi inclu Roboto quand t'as lucida qui fait la même chose
				'text-overflow': 'hidden',
				'cursor': 'default',
			},
			'sidebar-resizer': { // zone à droite de la sidebar permettant de la redimensionner
				'width': '6px',
				'height': '100%',
				'cursor': 'col-resize',
				'float': 'right',
			},
			'folders-container': { // englobe le titre, l'icone et les descendant d'un dossier

			},
			'folder-title-bar': {
				'white-space': 'nowrap',
				'background-color': 'transparent',
			},
			'folder-context-menu': {
				'background-color': 'rgba(0, 0, 0, 0.2)',
			},
			'folders-icon': { // icone d'un dossier
				'transition': 'ease all 0.2s',
				'background-image': 'url(data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%22401px%22%20height%3D%22401px%22%20viewBox%3D%220%200%20401%20401%22%3E%3Cpolygon%20fill%3D%22%23%color%%22%20points%3D%22100%2C27%20401%2C201%20100%2C374%22%2F%3E%3C%2Fsvg%3E)',
				'background-size': 'cover',
				'color': '#b4b4c8', // permet de colorer l'image de fond, uniquement en hexa
				'display': 'inline-block',
				'width': '0.7em',
				'height': '0.7em',
				'margin-right': '7px',
				'transform': 'rotate(0deg)',
			},
			'folder-icon-active': { // icone d'un dossier si le dossier est ouvert
				'transform': 'rotate(90deg)',
			},
			'folder-name': { // nom du dossier						
				'color': 'rgb(180, 180, 200)',
				'text-shadow': '1px 1px 1px black',
				'display': 'inline-block',
				'margin': '2px',
			},
			'folder-name-active': { // nom du dossier si ouvert

			},
			'folder-name-input': {
				'background-color': 'rgb(20, 20, 20)',
				'border': 'solid 1px rgb(0, 120, 255)',
				'border-radius': '3px',
				'padding-left': '1em',
				'color': 'rgb(220, 220, 220)',
			},
			'folder-content': { // conteneur des descendants du dossier

			},
			'file-title-bar': {
				'white-space': 'nowrap',
				'background-color': 'transparent',
			},
			'file-title-bar-active': {
				'background-color' : 'rgb(35, 35, 35)',
			},
			'file-context-menu': {
				'background-color': 'rgba(0, 0, 0, 0.2)',
			},
			'file-icon': { // icone d'un fichier
				'background-image': 'url(data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20id%3D%22Capa_1%22%20x%3D%220px%22%20y%3D%220px%22%20viewBox%3D%220%200%20307.454%20307.454%22%20style%3D%22enable-background%3Anew%200%200%20307.454%20307.454%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M241.19%20200.541c0%202.691-2.201%204.895-4.893%204.895H71.158c-2.693%200-4.895-2.203-4.895-4.895v-3.261%20c0-2.691%202.201-4.894%204.895-4.894h165.139c2.691%200%204.9%202.2%204.9%204.894L241.19%20200.541L241.19%20200.541z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M140.219%2064.99c0%202.69-2.201%204.893-4.895%204.893H71.158c-2.693%200-4.895-2.202-4.895-4.893v-3.263%20c0-2.691%202.201-4.894%204.895-4.894h64.166c2.693%200%204.9%202.2%204.9%204.894V64.99z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M238.713%20245.727c0%202.69-2.203%204.892-4.897%204.892H169.65c-2.693%200-4.895-2.202-4.895-4.892v-3.263%20c0-2.691%202.201-4.894%204.895-4.894h64.166c2.693%200%204.9%202.2%204.9%204.894V245.727z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M174.238%20110.172c0%202.691-2.201%204.895-4.893%204.895H71.157c-2.693%200-4.895-2.203-4.895-4.895v-3.261%20c0-2.691%202.201-4.893%204.895-4.893h98.188c2.691%200%204.9%202.2%204.9%204.893V110.172z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M241.19%20155.357c0%202.691-2.201%204.893-4.893%204.893H71.158c-2.693%200-4.895-2.202-4.895-4.893v-3.262%20c0-2.691%202.201-4.894%204.895-4.894h165.139c2.691%200%204.9%202.2%204.9%204.894L241.19%20155.357L241.19%20155.357z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M272.401%2074.521L193.278%209.454C186.727%204.1%20175.4%200%20166.9%200H42.442c-10.76%200-19.516%208.754-19.516%2019.5%20c0%200%200%20210%200%20267.839c0%2020.1%2019%2020.1%2019.5%2020.099c48.34%200%20222.6%200%20222.6%200c10.762%200%2019.516-8.755%2019.516-19.517%20V100.198C284.528%2091.2%20279.3%2080.2%20272.4%2074.521z%20M187.867%2029.475c0-4.781%203.959-1.113%203.959-1.113l62.717%2053.6%20c0%200%204%203.949-2.865%203.949c-14.688%200-58.746%200-58.746%200c-2.793%200-5.065-2.271-5.065-5.064%20C187.867%2080.8%20187.9%2042.3%20187.9%2029.475z%20M265.012%20292.999c0%200-179.055%200-223.99%200c-0.801%200-3.643-0.229-3.643-4.182%20c0-54.407%200-269.302%200-269.302c0-2.745%202.32-5.063%205.063-5.063h124.464c2.107%200%206.5%201.1%206.5%207.138v59.242%20c0%2010.8%208.8%2019.5%2019.5%2019.516h73.523c1.342%200%203.6%200.9%203.6%204.169c0%200.1%200%20183.4%200%20183.4%20C270.076%20290.7%20267.8%20293%20265%20292.999z%22%2F%3E%3C%2Fsvg%3E)',
				'color': '#b4b4c8',
				'display': 'inline-block',
				'width': '1em',
				'height': '1em',
				'margin-right': '7px',
				'background-size': 'cover',
				'vertical-align': 'sub'
			},
			'file-icon-active': { // icone d'un fichier si le fichier est selectionné
				//'background-image': 'url(data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20id%3D%22Capa_1%22%20x%3D%220px%22%20y%3D%220px%22%20viewBox%3D%220%200%20307.454%20307.454%22%20style%3D%22enable-background%3Anew%200%200%20307.454%20307.454%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M241.19%20200.541c0%202.691-2.201%204.895-4.893%204.895H71.158c-2.693%200-4.895-2.203-4.895-4.895v-3.261%20c0-2.691%202.201-4.894%204.895-4.894h165.139c2.691%200%204.9%202.2%204.9%204.894L241.19%20200.541L241.19%20200.541z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M140.219%2064.99c0%202.69-2.201%204.893-4.895%204.893H71.158c-2.693%200-4.895-2.202-4.895-4.893v-3.263%20c0-2.691%202.201-4.894%204.895-4.894h64.166c2.693%200%204.9%202.2%204.9%204.894V64.99z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M238.713%20245.727c0%202.69-2.203%204.892-4.897%204.892H169.65c-2.693%200-4.895-2.202-4.895-4.892v-3.263%20c0-2.691%202.201-4.894%204.895-4.894h64.166c2.693%200%204.9%202.2%204.9%204.894V245.727z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M174.238%20110.172c0%202.691-2.201%204.895-4.893%204.895H71.157c-2.693%200-4.895-2.203-4.895-4.895v-3.261%20c0-2.691%202.201-4.893%204.895-4.893h98.188c2.691%200%204.9%202.2%204.9%204.893V110.172z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M241.19%20155.357c0%202.691-2.201%204.893-4.893%204.893H71.158c-2.693%200-4.895-2.202-4.895-4.893v-3.262%20c0-2.691%202.201-4.894%204.895-4.894h165.139c2.691%200%204.9%202.2%204.9%204.894L241.19%20155.357L241.19%20155.357z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M272.401%2074.521L193.278%209.454C186.727%204.1%20175.4%200%20166.9%200H42.442c-10.76%200-19.516%208.754-19.516%2019.5%20c0%200%200%20210%200%20267.839c0%2020.1%2019%2020.1%2019.5%2020.099c48.34%200%20222.6%200%20222.6%200c10.762%200%2019.516-8.755%2019.516-19.517%20V100.198C284.528%2091.2%20279.3%2080.2%20272.4%2074.521z%20M187.867%2029.475c0-4.781%203.959-1.113%203.959-1.113l62.717%2053.6%20c0%200%204%203.949-2.865%203.949c-14.688%200-58.746%200-58.746%200c-2.793%200-5.065-2.271-5.065-5.064%20C187.867%2080.8%20187.9%2042.3%20187.9%2029.475z%20M265.012%20292.999c0%200-179.055%200-223.99%200c-0.801%200-3.643-0.229-3.643-4.182%20c0-54.407%200-269.302%200-269.302c0-2.745%202.32-5.063%205.063-5.063h124.464c2.107%200%206.5%201.1%206.5%207.138v59.242%20c0%2010.8%208.8%2019.5%2019.5%2019.516h73.523c1.342%200%203.6%200.9%203.6%204.169c0%200.1%200%20183.4%200%20183.4%20C270.076%20290.7%20267.8%20293%20265%20292.999z%22%2F%3E%3C%2Fsvg%3E)',
				//'color': '#b4b4c8',
			},
			'file-icon-wrong': { // icone d'un fichier si le fichier est erroné
				//'background-image': 'url(data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20id%3D%22Capa_1%22%20x%3D%220px%22%20y%3D%220px%22%20viewBox%3D%220%200%20307.454%20307.454%22%20style%3D%22enable-background%3Anew%200%200%20307.454%20307.454%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M241.19%20200.541c0%202.691-2.201%204.895-4.893%204.895H71.158c-2.693%200-4.895-2.203-4.895-4.895v-3.261%20c0-2.691%202.201-4.894%204.895-4.894h165.139c2.691%200%204.9%202.2%204.9%204.894L241.19%20200.541L241.19%20200.541z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M140.219%2064.99c0%202.69-2.201%204.893-4.895%204.893H71.158c-2.693%200-4.895-2.202-4.895-4.893v-3.263%20c0-2.691%202.201-4.894%204.895-4.894h64.166c2.693%200%204.9%202.2%204.9%204.894V64.99z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M238.713%20245.727c0%202.69-2.203%204.892-4.897%204.892H169.65c-2.693%200-4.895-2.202-4.895-4.892v-3.263%20c0-2.691%202.201-4.894%204.895-4.894h64.166c2.693%200%204.9%202.2%204.9%204.894V245.727z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M174.238%20110.172c0%202.691-2.201%204.895-4.893%204.895H71.157c-2.693%200-4.895-2.203-4.895-4.895v-3.261%20c0-2.691%202.201-4.893%204.895-4.893h98.188c2.691%200%204.9%202.2%204.9%204.893V110.172z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M241.19%20155.357c0%202.691-2.201%204.893-4.893%204.893H71.158c-2.693%200-4.895-2.202-4.895-4.893v-3.262%20c0-2.691%202.201-4.894%204.895-4.894h165.139c2.691%200%204.9%202.2%204.9%204.894L241.19%20155.357L241.19%20155.357z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M272.401%2074.521L193.278%209.454C186.727%204.1%20175.4%200%20166.9%200H42.442c-10.76%200-19.516%208.754-19.516%2019.5%20c0%200%200%20210%200%20267.839c0%2020.1%2019%2020.1%2019.5%2020.099c48.34%200%20222.6%200%20222.6%200c10.762%200%2019.516-8.755%2019.516-19.517%20V100.198C284.528%2091.2%20279.3%2080.2%20272.4%2074.521z%20M187.867%2029.475c0-4.781%203.959-1.113%203.959-1.113l62.717%2053.6%20c0%200%204%203.949-2.865%203.949c-14.688%200-58.746%200-58.746%200c-2.793%200-5.065-2.271-5.065-5.064%20C187.867%2080.8%20187.9%2042.3%20187.9%2029.475z%20M265.012%20292.999c0%200-179.055%200-223.99%200c-0.801%200-3.643-0.229-3.643-4.182%20c0-54.407%200-269.302%200-269.302c0-2.745%202.32-5.063%205.063-5.063h124.464c2.107%200%206.5%201.1%206.5%207.138v59.242%20c0%2010.8%208.8%2019.5%2019.5%2019.516h73.523c1.342%200%203.6%200.9%203.6%204.169c0%200.1%200%20183.4%200%20183.4%20C270.076%20290.7%20267.8%20293%20265%20292.999z%22%2F%3E%3C%2Fsvg%3E)',
				//'color': '#d61e1e',
			},
			'file-icon-active-wrong': { // icone d'un fichier si il est faux et selectionné
				//'background-image': 'url(data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20id%3D%22Capa_1%22%20x%3D%220px%22%20y%3D%220px%22%20viewBox%3D%220%200%20307.454%20307.454%22%20style%3D%22enable-background%3Anew%200%200%20307.454%20307.454%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M241.19%20200.541c0%202.691-2.201%204.895-4.893%204.895H71.158c-2.693%200-4.895-2.203-4.895-4.895v-3.261%20c0-2.691%202.201-4.894%204.895-4.894h165.139c2.691%200%204.9%202.2%204.9%204.894L241.19%20200.541L241.19%20200.541z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M140.219%2064.99c0%202.69-2.201%204.893-4.895%204.893H71.158c-2.693%200-4.895-2.202-4.895-4.893v-3.263%20c0-2.691%202.201-4.894%204.895-4.894h64.166c2.693%200%204.9%202.2%204.9%204.894V64.99z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M238.713%20245.727c0%202.69-2.203%204.892-4.897%204.892H169.65c-2.693%200-4.895-2.202-4.895-4.892v-3.263%20c0-2.691%202.201-4.894%204.895-4.894h64.166c2.693%200%204.9%202.2%204.9%204.894V245.727z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M174.238%20110.172c0%202.691-2.201%204.895-4.893%204.895H71.157c-2.693%200-4.895-2.203-4.895-4.895v-3.261%20c0-2.691%202.201-4.893%204.895-4.893h98.188c2.691%200%204.9%202.2%204.9%204.893V110.172z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M241.19%20155.357c0%202.691-2.201%204.893-4.893%204.893H71.158c-2.693%200-4.895-2.202-4.895-4.893v-3.262%20c0-2.691%202.201-4.894%204.895-4.894h165.139c2.691%200%204.9%202.2%204.9%204.894L241.19%20155.357L241.19%20155.357z%22%2F%3E%3Cpath%20fill%3D%22%23%color%%22%20d%3D%22M272.401%2074.521L193.278%209.454C186.727%204.1%20175.4%200%20166.9%200H42.442c-10.76%200-19.516%208.754-19.516%2019.5%20c0%200%200%20210%200%20267.839c0%2020.1%2019%2020.1%2019.5%2020.099c48.34%200%20222.6%200%20222.6%200c10.762%200%2019.516-8.755%2019.516-19.517%20V100.198C284.528%2091.2%20279.3%2080.2%20272.4%2074.521z%20M187.867%2029.475c0-4.781%203.959-1.113%203.959-1.113l62.717%2053.6%20c0%200%204%203.949-2.865%203.949c-14.688%200-58.746%200-58.746%200c-2.793%200-5.065-2.271-5.065-5.064%20C187.867%2080.8%20187.9%2042.3%20187.9%2029.475z%20M265.012%20292.999c0%200-179.055%200-223.99%200c-0.801%200-3.643-0.229-3.643-4.182%20c0-54.407%200-269.302%200-269.302c0-2.745%202.32-5.063%205.063-5.063h124.464c2.107%200%206.5%201.1%206.5%207.138v59.242%20c0%2010.8%208.8%2019.5%2019.5%2019.516h73.523c1.342%200%203.6%200.9%203.6%204.169c0%200.1%200%20183.4%200%20183.4%20C270.076%20290.7%20267.8%20293%20265%20292.999z%22%2F%3E%3C%2Fsvg%3E)',
				//'color': '#d61e1e',
			},
			'file-name': { // nom d'un fichier
				'color': 'rgb(210, 210, 210)',
				'text-shadow': '1px 1px 1px black',
				'display': 'inline-block',
				'margin': '3px',
			},
			'file-name-active': { // nom d'un fichier si le fichier est selectionné
				'color': 'rgb(120, 200, 255)',
			},
			'file-name-wrong': { // nom d'un fichier si le fichier est erroné
				'color': 'rgb(255, 120, 120)',
			},
			'file-name-active-wrong': { // nom d'un fichier si il est faux et selectionné
				'color': 'rgb(255, 120, 120)',
			},
			'context-menu-container': {
				'background-color': 'rgb(250, 250, 250)',
			},
			'context-menu-item': {
				'color': 'rgb(40, 40, 40)',
				'box-sizing': 'border-box',
				'font-size': '1.1em',
				'font-family': '"Lucida Sans Unicode", "Roboto"',
				'padding': '0.4em 1.5em',
				'background-color': 'transparent',
				'border-top': 'solid 1px transparent',
				'border-bottom': 'solid 1px transparent',
				'cursor': 'default',
			},
			'context-menu-item-hover': {
				'box-sizing': 'border-box',
				'background-color': 'rgb(235, 235, 235)',
				'border-top': 'solid 1px rgb(215, 215, 215)',
				'border-bottom': 'solid 1px rgb(215, 215, 215)',
			},
			'context-menu-name': {
				'margin-left': '1em',
			},
			'context-menu-separator': {
				'border': 'none',
				'border-top': 'solid 1px rgb(210, 210, 210)',
				'margin-top': '2px',
				'margin-bottom': '3px',
				'width': '100%',
			}
		}
	};

	var statusCode = Object.freeze({
		success: 'Succès', // bah succès...
		failed: 'Erreur', // erreur inconnue, mais erreur quand même
		alreadyExists: 'Ce nom est déja utilisé', // le fichier / dossier existe déja
		forbiddenChar: 'L\'utilisation du caractère / est interdite', // le nom contient un caractère interdit (genre un /)
		isChildOf: 'Ce dossier est parent de la cible. Impossible de le déplacer', // on essaye de déplacer un dossier dans un de ses descendant (donc bouclage)
	});

	var currentTheme = 'dark';

	function Dir(d) {
		var data = {
			folders: d.folders || {},
			files: d.files || {},
			parent: d.parent || null,
			name: d.name || 'Nouveau Dossier',
			ctxMenu: 0,
			design: {
				container: 0,
				folder: 0,
				titleBar: 0,
				icon: 0,
				name: 0,
				content: 0,
				active: false,
				indent: d.indent || (d.parent ? d.parent.getIndent() + 1 : 0),
			}
		};

		var that = this;

		if(d.folders) {
			insensCaseSort(Object.keys(d.folders)).forEach(function(item) {
				data.folders[item].setParent(this);
			});
		}
		if(d.files) {
			insensCaseSort(Object.keys(d.files)).forEach(function(item) {
				data.files[item].setParent(this);
			});
		}

		this.addDir = function(dir) {
			if(data.folders[dir.getName()]) return statusCode.alreadyExists;
			data.folders[dir.getName()] = dir;
			data.folders[dir.getName()].setParent(that);
			return statusCode.success;
		};

		this.addFile = function(file) {
			if(data.files[file.getName()]) return statusCode.alreadyExists;
			data.files[file.getName()] = file;
			data.files[file.getName()].setParent(that);
			return statusCode.success;
		};

		this.createDir = function(name, d) {
			if(name) name = name.trim();
			var d = d || {};
			d.name = (name ? name : undefined);
			d.parent = that;
			var dir = new Dir(d);
			if(data.folders[dir.getName()]) return statusCode.alreadyExists;
			data.folders[dir.getName()] = dir;
			// on refresh la directory actuelle
			that.refresh();
			// on ouvre le folder actuel
			that.unfold();
			// et on edite le nom du fichier nouvellement créé
			data.folders[dir.getName()].askRename();

			return statusCode.success;
		};

		this.createFile = function(name, d) {
			name = name.trim();
			var d = d || {};
			d.name = (name ? name : undefined);
			d.parent = that;
			var file = new File(d);
			if(data.files[name]) return statusCode.alreadyExists;
			data.files[name] = file;
			return statusCode.success;
		};

		this.setParent = function(parent) {
			if(data.parent !== null) data.parent = parent;
		};

		this.delete = function() {
			Object.keys(data.files).forEach(function(index) {
				data.files[index].delete();
			});
			Object.keys(data.folders).forEach(function(index) {
				data.folders[index].delete();
			});
			if(data.parent !== null) delete data.parent.getFolders()[data.name];
		};

		this.rename = function(newName) {
			newName = newName.trim();
			if(newName.indexOf('/') !== -1) return statusCode.forbiddenChar;
			if(data.parent.getFolders()[newName]) return statusCode.alreadyExists;
			if(data.parent !== null) {
				data.parent.getFolders()[newName] = that;
				delete data.parent.getFolders()[data.name];
			}			
			data.name = newName;
			return statusCode.success;
		};

		this.getFiles = function() {
			return data.files;
		};

		this.getFolders = function() {
			return data.folders;
		};

		this.getName = function() {
			return data.name;
		};

		this.getParent = function() {
			return data.parent;
		};

		this.updateDesign = function() {
			// mise à jour en cas de changement de thème
		};

		this.fold = function() {
			if(!data.design.icon.css) return;
			data.design.icon.css(theme[currentTheme]['folders-icon']);
			if(theme[currentTheme]['folders-icon'].color && theme[currentTheme]['folders-icon']['background-image']) {
				data.design.icon.css('background-image', colorSVG(theme[currentTheme]['folders-icon']['background-image'], theme[currentTheme]['folders-icon'].color));
			}
			var duration = window.getComputedStyle(data.design.icon[0])['transition-duration'];
			duration = (duration.indexOf('ms') !== -1) ? Math.floor(parseFloat(duration)) : Math.floor(parseFloat(duration)*1000);
			data.design.content.stop(true, false).slideUp(duration);
		};

		this.unfold = function() {
			if(!data.design.icon.css) return;
			data.design.icon.css(theme[currentTheme]['folder-icon-active']);
			if(theme[currentTheme]['folders-icon'].color && theme[currentTheme]['folders-icon']['background-image']) {
				data.design.icon.css('background-image', colorSVG(theme[currentTheme]['folders-icon']['background-image'], theme[currentTheme]['folders-icon'].color));
			}			
			var duration = window.getComputedStyle(data.design.icon[0])['transition-duration'];
			duration = (duration.indexOf('ms') !== -1) ? Math.floor(parseFloat(duration)) : Math.floor(parseFloat(duration)*1000);
			data.design.content.stop(true, false).slideDown(duration);
		};

		this.toggleFold = function() {
			data.design.active = !data.design.active;
			if(data.design.active) that.unfold();
			else that.fold();
		};

		this.moveTo = function(dir) {
			// permet de déplacer cette directory à l'intérieure d'une autre directory
			if(!that.isParentOf(dir) && that.getParent() !== null) {
				if(dir.addDir(that) === statusCode.success) {
					delete that.getParent().getFolders()[that.getName()];
					return statusCode.success;
				}
				return statusCode.alreadyExists;
			}
			return statusCode.isChildOf;
		};

		this.isParentOf = function(dir) {
			current = dir;
			while(current.getParent() !== null) {
				if(current.getParent() === that) return true;
				current = current.getParent();
			}
			return dir === that;
		};

		this.unselectFiles = function() {
			Object.keys(data.folders).forEach(function(index) {
				data.folders[index].unselectFiles();
			});

			Object.keys(data.files).forEach(function(index) {
				data.files[index].unselect();
			});
		};

		this.getRoot = function() {
			var current = that;
			while(current.getParent() !== null) current = current.getParent();
			return current;
		};


		/*************************************************************************************************************************************************/
		/***************************************************            DESIGN        *******************************************************************/
		/***********************************************************************************************************************************************/

		this.initDesign = function(container, indent) {
			// On affiche chaque folder dans ce format : 
			/*
				ef-folder-container
				|	.ef-folder data-name="nom du dossier"
				|	|	.ef-folder-title-container
				|	|	|	.ef-folder-icon
				|	|	|	.ef-folder-title
				|	|	.ef-folder-container
				|	.ef-file data-name="nom du fichier"
				|	|	.ef-file-title-container
				|	|	|	.ef-file-icon
				|	|	|	.ef-file-title
			*/
			data.design.container = container;
			data.design.folder = $(document.createElement('div')).addClass('ef-folder').attr('data-name', data.name).appendTo(data.design.container);
			data.design.titleBar = $(document.createElement('div')).addClass('ef-folder-title-container').appendTo(data.design.folder);
			data.design.icon = $(document.createElement('div')).addClass('ef-folder-icon').appendTo(data.design.titleBar);
			data.design.name = $(document.createElement('div')).addClass('ef-folder-title').appendTo(data.design.titleBar);
			data.design.content = $(document.createElement('div')).addClass('ef-folder-container').appendTo(data.design.folder);

			if(that.getParent() !== null) {
				// construction du défaut
				genCSS(data.design.titleBar, theme[currentTheme]['folder-title-bar']);

				data.design.icon.css({
					'margin-left': indent + 'em',
				});

				genCSS(data.design.icon, theme[currentTheme]['folders-icon']);
				genCSS(data.design.name, theme[currentTheme]['folder-name']);

				data.design.name.text(that.getName);

				data.design.titleBar.click(that.toggleFold);

				that.fold();
			}

			// on génère le menu contextuel

			data.ctxMenu = new ContextualMenu(data.design.titleBar);
			data.ctxMenu.addItem('Nouveau fichier', function() {
			}).addItem('Nouveau dossier', function() {
				that.createDir();
			}).addSeparator().addItem('Renommer...', function() {
				that.askRename();
			}).addItem('Supprimer', function() {

			});

			data.ctxMenu.onOpen(function() {
				genCSS(data.design.titleBar, theme[currentTheme]['folder-context-menu']);
			});

			data.ctxMenu.onClose(function() {
				genCSS(data.design.titleBar, theme[currentTheme]['folder-title-bar']);
			});

			data.ctxMenu.gen();

			// on ajoute récursivement les enfants
			insensCaseSort(Object.keys(that.getFolders())).forEach(function(index) {
				that.getFolders()[index].initDesign(data.design.content, indent + 1);
			});

			insensCaseSort(Object.keys(that.getFiles())).forEach(function(index) {
				that.getFiles()[index].initDesign(data.design.content, indent + 1);
			});

			//if(storage.isExpended(that)) ...;
		};

		this.regenContent = function() {
			// on ajoute récursivement les enfants
			insensCaseSort(Object.keys(that.getFolders())).forEach(function(index) {
				that.getFolders()[index].initDesign(data.design.content, that.getIndent() + 1);	
			});

			insensCaseSort(Object.keys(that.getFiles())).forEach(function(index) {
				that.getFiles()[index].initDesign(data.design.content, indent + 1);
			});
		};

		this.refresh = function() {
			if(!data.design.content.html) return;
			data.design.content.html('');
			that.regenContent();
		};

		this.askRename = function() {
			if(!data.design.name.css) return;
			data.ctxMenu.pause(true);
			// on change le name en input
			var input = $(document.createElement('input')).css(theme[currentTheme]['folder-name-input']).val(that.getName());
			var displayTmp = data.design.name.css('display');
			data.design.name.css('display', 'none');
			input.appendTo(data.design.titleBar);
			input.focus();
			input.select();

			input.bind('keyup', function(e) {
				if(e.which === 13) {
					var name = input.val();
					data.ctxMenu.pause(false);
					var stat = that.rename(name);
					input.remove();
					data.design.name.css('display', displayTmp);
					if(stat === statusCode.success) {
						data.design.name.text(name);
					}
					else {
						_.toast(stat);
					}
				}
			});
		};

		this.getIndent = function(indent) {
			return data.design.indent;
		};

		this.getElement = function() {
			return data.design.titleBar;
		};
	}

	function File(d) {
		var data = {
			id: d.id || 0,
			name: d.name || 'Nouveau fichier.ls',
			valid: d.valid || false,
			lvl: d.lvl || 'inconnu',
			lines: d.lines || 0,
			chars: d.chars || 0,
			parent: d.parent || 0,
			ctxMenu: 0,
			design: {
				container: 0,
				file: 0,
				icon: 0,
				name: 0,
				active: 0,
			}
		};

		var that = this;

		this.addDir = function(dir) {
			return that.getParent().addDir(dir);
		};

		this.addFile = function(file) {
			return that.getParent().addFile(file);
		};

		this.createDir = function(name, d) {
			return that.getParent().createDir(name, d);
		};

		this.createFile = function(name, d) {
			return that.getParent().createFile(name, d);
		};

		this.setParent = function(parent) {
			data.parent = parent;
		};

		this.delete = function() {
			delete that.getParent().getFiles()[that.getName()];
		};

		this.rename = function(newName) {
			newName = newName.trim();
			if(newName.indexOf('/') !== -1) return statusCode.forbiddenChar;
			if(data.parent !== null) {
				data.parent.getFiles()[newName] = that;
				delete data.parent.getFiles()[data.name];
			}			
			data.name = newName;
			return statusCode.success;
		};

		this.getName = function() {
			return data.name;
		};

		this.getParent = function() {
			return data.parent;
		};

		this.updateDesign = function() {
			// mise à jour en cas de changement de thème
		};

		this.moveTo = function(dir) {
			// permet de déplacer cette directory à l'intérieure d'une autre directory
			if(dir.addFile(that) === statusCode.success) {
				delete that.getParent().getFiles()[that.getName()];
				return statusCode.success;
			}
			return statusCode.alreadyExists;
		};

		this.valid = function(valid) {
			if(valid === undefined) return data.valid;
			data.valid = valid;
		};

		this.lvl = function(lvl) {
			if(lvl === undefined) return data.lvl;
			data.lvl = lvl;
		};

		this.counter = function(lines, chars) {
			if(chars === undefined) return {'lines': data.lines, 'chars': data.chars};
			data.lines = lines;
			data.chars = chars;
		};

		this.unselect = function() {
			data.design.active = false;

			genCSS(data.design.file, theme[currentTheme]['file-title-bar']);
			genCSS(data.design.name, theme[currentTheme]['file-name']);
			genCSS(data.design.icon, theme[currentTheme]['file-icon']);
			if(!data.valid) {
				genCSS(data.design.name, theme[currentTheme]['file-name-wrong']);
				genCSS(data.design.icon, theme[currentTheme]['file-icon-wrong']);
			}
		};

		this.select = function() {
			that.getParent().getRoot().unselectFiles();

			genCSS(data.design.file, theme[currentTheme]['file-title-bar-active']);
			genCSS(data.design.name, theme[currentTheme]['file-name-active']);
			genCSS(data.design.icon, theme[currentTheme]['file-icon-active']);
			if(!data.valid) {
				genCSS(data.design.name, theme[currentTheme]['file-name-active-wrong']);
				genCSS(data.design.icon, theme[currentTheme]['file-icon-active-wrong']);
			}
			LW.page('/editor/' + data.id);
			data.design.active = true;
		};

		this.initDesign = function(container, indent) {
			// On affiche chaque folder dans ce format : 
			/*
				ef-folder-container
				|	.ef-folder data-name="nom du dossier"
				|	|	.ef-folder-title-container
				|	|	|	.ef-folder-icon
				|	|	|	.ef-folder-title
				|	|	.ef-folder-container
				|	.ef-file data-name="nom du fichier"
				|	|	.ef-file-icon
				|	|	.ef-file-title
			*/

			data.design.container = container;
			data.design.file = $(document.createElement('div')).addClass('ef-file').attr('data-name', data.name).appendTo(data.design.container);
			data.design.icon = $(document.createElement('div')).addClass('ef-file-icon').appendTo(data.design.file);
			data.design.name = $(document.createElement('div')).addClass('ef-file-title').appendTo(data.design.file);
			
			// on génère le menu contextuel

			data.ctxMenu = new ContextualMenu(data.design.file);
			data.ctxMenu.addItem('Nouveau fichier', function() {
			}).addItem('Nouveau dossier', function() {
				that.createDir();
			}).addSeparator().addItem('Renommer...', function() {
				that.askRename();
			}).addItem('Supprimer', function() {

			});

			data.ctxMenu.onOpen(function() {
				if(!data.design.active) {
					genCSS(data.design.file, theme[currentTheme]['file-context-menu']);
				}
			});

			data.ctxMenu.onClose(function() {
				if(!data.design.active) {
					genCSS(data.design.file, theme[currentTheme]['file-title-bar']);
				}
			});

			data.ctxMenu.gen();

			// construction du défaut
			genCSS(data.design.file, theme[currentTheme]['file-title-bar']);

			data.design.icon.css({
				'margin-left': 'calc(' + (indent*0.7) + 'em + ' + (indent*7) + 'px)',
			});

			genCSS(data.design.icon, theme[currentTheme]['file-icon']);

			data.design.name.text(that.getName());
			genCSS(data.design.name, theme[currentTheme]['file-name']);
			if(!data.valid) {
				genCSS(data.design.name, theme[currentTheme]['file-name-wrong']);
				genCSS(data.design.icon, theme[currentTheme]['file-icon-wrong']);
			} 

			data.design.file.click(that.select);
		};

		this.getElement = function() {
			return data.design.file;
		};
	}

	function ContextualMenu(parents) {
		var data = {
			entries: [], // {separator: bool, text: nom du truc, id: identifiant du truc, disabled: bool, callback}
			changes: true,
			parent: parents,
			pause: false,
			onOpen: function(){},
			onClose: function(){},
			isOpen: false,
			design: {
				container: 0,
				entriesList: [], // {separator: bool, element}
			}
		};

		var that = this;

		this.addItem = function(arg, callback) {
			data.changes = true;
			data.entries.push((typeof arg === 'string') ? {
				separator: false,
				text: arg,
				id: arg,
				disabled: false,
				callback: callback
			} : {
				separator: false,
				text: (arg.text) ? arg.text : '[item name]',
				id: (arg.id) ? arg.id : '0',
				disabled: (arg.disabled) ? arg.disabled : false,
				callback: callback
			});
			return that;
		};

		this.addSeparator = function() {
			data.changes = true;
			data.entries.push({
				separator: true
			});
			return that;
		};

		this.gen = function() {
			if(!data.design.container) {
				data.design.container = $(document.createElement('div')).css(theme[currentTheme]['context-menu-container']).appendTo($(document.body));
				data.design.container.css({
					'position': 'absolute',
					'z-index': '3000',
					'display': 'none',
					'flex-direction': 'column',
				});
			}
			data.design.container.html('');			

			Object.keys(data.entries).forEach(function(index) {
				(function() {
					if(data.entries[index].separator) {
						var current = $(document.createElement('hr')).css(theme[currentTheme]['context-menu-separator']).appendTo(data.design.container);
					}
					else {
						var current = $(document.createElement('div')).css(theme[currentTheme]['context-menu-item']).hover(function() {
							$(this).css(theme[currentTheme]['context-menu-item-hover']);
						}, function() {
							$(this).css(theme[currentTheme]['context-menu-item']);
						}).appendTo(data.design.container);
						var name = $(document.createElement('div')).text(data.entries[index].text).appendTo(current);
						current.click(function() {
							that.hide();
							data.entries[index].callback();
						});
					}	
				})();
			});

			data.parent.bind('contextmenu', function(e) {
				if(data.pause) return;
				e.preventDefault();
				if(data.changes) that.gen();
				data.design.container.css({
					'left': e.pageX + 'px',
					'top': e.pageY + 'px',
				});
				that.show();
			});

			data.design.container.bind('mousedown', function(e) {
				e.stopPropagation();
			});

			$(document).bind('mousedown', function() {
				if(data.isOpen) {
					that.hide();
				}
			});

			data.changes = false;
		};

		this.show = function() {
			data.isOpen = true;
			data.design.container.css('display', 'flex');
			data.onOpen();
		};

		this.hide = function() {
			data.isOpen = false;
			data.design.container.css('display', 'none');
			data.onClose();
		};

		this.pause = function(p) {
			data.pause = p;
		};

		this.onOpen = function(func) {
			data.onOpen = func;
		};

		this.onClose = function(func) {
			data.onClose = func;
		}
	}

	function strToPath(path) {

	}

	function getDir(path) { // retourne un dossier via son lien
		var current = root;

		if(typeof path === "string") path = strToPath(path);
	}

	function getFile(path) { // retourne un fichier via son lien

	}

	// à la pauvre, vu qu'on a pas le droit de modifier le prototype d'Array... La tristesse
	function insensCaseSort(array) {
		return array.sort(function(a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
	}

	function setUnselectable(element) {
		element.attr('unselectable','on')
     	.css({
			'-moz-user-select':'-moz-none',
			'-moz-user-select':'none',
			'-o-user-select':'none',
			'-khtml-user-select':'none',
			'-webkit-user-select':'none',
			'-ms-user-select':'none',
			'user-select':'none'
     	}).bind('selectstart', function(){ return false; });
	}

	function colorSVG(svg, color) {
		color = color.replace(/\#/g, '');
		return svg.replace(/\%color\%/g, color);
	}

	function genCSS(item, css) {
		if(css['background-image'] && css['color']) {
			item.css(css);
			item.css('background-image', colorSVG(css['background-image'], css['color']));
		}
		else {
			item.css(css);
		}
	}

	function initSidebar(sidebar) {
		sidebar.unbind().css(theme[currentTheme].sidebar).html('');
		initSidebarSizer(sidebar);
		setUnselectable(sidebar);
	}

	function initSidebarSizer(sidebar) {
		var data = {
			width: 0,
			mouseOrigin: 0,
			left: 0,
			moving: false
		};
		var sizer = $(document.createElement('div')).addClass('ef-sizer').css(theme[currentTheme]['sidebar-resizer'])
		.on('mousedown', function(e) {
			data.moving = true;
			data.mouseOrigin = e.pageX;
		})
		.appendTo(sidebar);

		$(document).on('mouseup', function(e) {
			if(data.moving) {
				data.moving = false;
				data.width = sidebar.outerWidth();
			}
		});

		$(document).on('mousemove', function(e) {
			if(data.moving && (data.width + (e.pageX - data.mouseOrigin)) < 0.9*(($('#editor-page .container').outerWidth() - 15)) && (data.width + (e.pageX - data.mouseOrigin)) > 50) {
				$('#editor-page .column10').css('width', 'calc(100% - ' + (data.width + (e.pageX - data.mouseOrigin)) + 'px)');
				sidebar.css('width', data.width + (e.pageX - data.mouseOrigin) + 'px');
				e.preventDefault();
			}
		});

		data.width = sidebar.outerWidth();
		data.left = sidebar.offset().left;

		var content = $(document.createElement('div')).css({
			height: '100%'
		}).appendTo(sidebar);

		var header = $(document.createElement('div')).attr('id', 'ef-header').appendTo(content);
		var iaList = $(document.createElement('div')).attr('id', 'ef-root').appendTo(content);
		var footer = $(document.createElement('div')).attr('id', 'ef-footer').appendTo(content);

		// POURQUOI LA COULEUR DE FOND NE VEUT PAS SE METTRE BORDEL !!!!!!!
		setTimeout(function() {
			sidebar.css('height', $('#editor-page .column10').outerHeight() - 15 + 'px');
		}, 500);

		$(window).resize(function() {
			sidebar.css('height', $('#editor-page .column10').outerHeight() - 15 + 'px');
			data.width = sidebar.outerWidth();
			data.left = sidebar.offset().left;
		});
	}

	// retourne le chemin vers la directory contenant le fichier, sans le fichier (dir/dir/file -> ['dir', 'dir'])
	function getFilePath(file) {
		return (file.indexOf('/') !== -1) ? file.substr(0, file.lastIndexOf('/')).split('/') : [];
	}

	// retourne le nom d'un fichier à partir de son chemin (dir/dir/file -> 'file')
	function getFileName(file) {
		return (file.indexOf('/') !== -1) ? file.substr(file.lastIndexOf('/') + 1) : file;
	}

	// construit l'arborescence des fichiers à partir des noms de fichiers
	function buildTree(files) {
		var root = new Dir({
			name: 'root',
			parent: null
		});

		for(var i = 0; i < files.length; ++i) {
			var path = getFilePath(files[i].name);
			var currentRoot = root;

			for(var j = 0; j < path.length; ++j) {
				if(!currentRoot.getFolders()[path[j]]) {
					currentRoot.createDir(path[j]);
				}
				currentRoot = currentRoot.getFolders()[path[j]];
			}

			currentRoot.createFile(getFileName(files[i].name), {
				id: files[i].id,
				valid: files[i].valid,
				lvl: files[i].level
			});
		}

		ertres = root;

		return root;
	}

	function init() {
		if(LW.currentPage === undefined || LW.on === undefined) {
			setTimeout(init, 200);
			return;
		}

		_.get('ai/get-farmer-ais/$', function(data) {
			if(data.success === false) {
				_.logW('[Editor Folders] Impossible de charger les IAs');
				return;
			}

			var root = buildTree(data.ais);

			LW.on('pageload', function() {
				if(LW.currentPage === 'editor') {
					initSidebar($('#editor-page .column2'));
					root.initDesign($('#ef-root'), 0);
				}
			});
		});
	}

	/*var root = new Dir({
		name: 'root',
		parent: null
	});

	root.createDir('essai');

	root.createFile('test.ls');

	root.getFolders()['essai'].createFile('IA.ls');
	root.getFolders()['essai'].createFile('fichier.ls');
	root.getFolders()['essai'].createDir('debug');
	root.getFolders()['essai'].getFolders()['debug'].createFile('debug.ls');
	root.createDir('final versions');

	LW.on('pageload', function() {
		if(LW.currentPage === 'editor') {
			initSidebar($('#editor-page .column2'));
			root.initDesign($('#ef-root'), 0);
		}
	});*/

	init();
//})();