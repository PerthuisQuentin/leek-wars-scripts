// ==UserScript==
// @name          [Leek Wars] Doc everywhere
// @namespace     https://github.com/Ebatsin/Leek-Wars/
// @version       0.3
// @description   Permet d'accéder à la documentation de n'importe quelle page
// @author        Twilight
// @projectPage   https://github.com/Ebatsin/Leek-Wars/
// @downloadURL   https://github.com/Ebatsin/Leek-Wars/raw/master/doc/doc.user.js
// @updateURL     https://github.com/Ebatsin/Leek-Wars/raw/master/doc/doc.user.js
// @match         http://leekwars.com/*
// ==/UserScript==

(function() {
	var cssCode = "\
.doc-win {\
transition: ease all 0.2s;\
position: fixed;\
font-size: 1rem;\
top: 0;\
z-index: 1000;\
width: 90%;\
height: 90%;\
margin-left: 5%;\
margin-top: 5vh;\
box-sizing: border-box;\
border: solid 1px hsl(0, 0%, 87%);\
}\
.doc-win.doc-hide{\
pointer-event: none;\
transform: scale(0.0001);\
opacity: 0;\
}\
.doc-win-header {\
height: 3em;\
background-color: hsl(0, 0%, 20%);\
border-bottom: solid 1px hsl(0, 0%, 13%);\
box-sizing: border-box;\
}\
\
.doc-win-header h2 {\
margin: 0;\
font-size: 2em;\
line-height: 1.5em;\
margin-left: 1em;\
color: white;\
}\
\
.doc-win-close {\
float: right;\
width: 1em;\
height: 1em;\
margin: 0.25em;\
cursor: pointer;\
text-align: center;\
line-height: 1em;\
font-size: 2em;\
color: white;\
text-shadow: 1px 1px black;\
}\
\
.doc-win-core {\
width: 100%;\
height: calc(100% - 3em);\
}\
\
.doc-win-sidebar {\
width: 20em;\
height: 100%;\
background-color: hsla(0, 0%, 20%, 0.95);\
float: left;\
border-right: solid 1px hsl(0, 0%, 13%);\
box-sizing: border-box;\
overflow-x: hidden;\
overflow-y: auto;\
}\
\
.doc-win-viewport {\
width: calc(100% - 20em);\
height: 100%;\
margin-left: 20em;\
background-color: hsl(0, 0%, 30%);\
}\
\
.doc-win-search {\
width: 100%;\
height: 3.5em;\
}\
\
.doc-win-searchbar {\
transition: ease background-color 0.2s;\
width: 100%;\
height: 100%;\
box-sizing: border-box;\
border-radius: 0;\
border: none !important;\
background-color: hsl(0, 0%, 40%);\
color: white;\
font-size: 2em !important;\
padding: 0 !important;\
padding-left: 9em !important;\
padding-right: 2.25em !important;\
outline: none !important;\
min-height: 0 !important;\
}\
\
.doc-win-min,\
.doc-win-max {\
border: none !important;\
transition: ease background-color 0.2s;\
height: 2.333em;\
width: 5.333em;\
position: absolute;\
box-sizing: border-box;\
border-radius: 0;\
border: none !important;\
font-size: 1.5em !important;\
min-height: 0 !important;\
padding: 0 !important;\
border-right: solid 1px hsl(0, 0%, 13%) !important;\
background-color: hsl(0, 0%, 35%);\
color: white;\
text-align: center;\
padding-top: 0.8em !important;\
outline: none !important;\
}\
\
.doc-win-max {\
margin-left: 5.333em;\
}\
\
.doc-win-search label {\
transition: ease line-height 0.2s;\
position: absolute;\
z-index: 2;\
color: white;\
width: 8em;\
text-align: center;\
line-height: 3.5em;\
pointer-events: none;\
}\
\
.doc-win-label-max {\
margin-left: 8em;\
}\
\
.doc-win-min:focus,\
.doc-win-max:focus {\
background-color: hsl(0, 0%, 38%);\
}\
\
.doc-win-searchbar:focus {\
background-color: hsl(0, 0%, 45%);\
}\
\
.doc-win-min:valid + label,\
.doc-win-min:focus + label,\
.doc-win-max:valid + label,\
.doc-win-max:focus + label {\
line-height: 1.5em;\
}\
\
.doc-win-min:not(:valid):not(:focus),\
.doc-win-max:not(:valid):not(:focus) {\
cursor: pointer;\
}\
\
.doc-win-min:not(:valid),\
.doc-win-max:not(:valid) {\
box-shadow: none;\
}\
\
.doc-win-submit {\
transition: ease background-color 0.4s;\
height: 3.5em;\
width: 3.5em;\
background-color: hsl(0, 0%, 30%);\
position: absolute;\
right: 0;\
margin-top: -3.5em;\
cursor: pointer;\
background-image: url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMS4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDQyNS4zNDMgNDI1LjM0MyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDI1LjM0MyA0MjUuMzQzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjUxMnB4IiBoZWlnaHQ9IjUxMnB4Ij4KPGc+Cgk8cGF0aCBkPSJNNDI1LjM0MywzOTEuNjg5TDI3OS4zNDUsMjY0Ljg1N2MyMS4yNDUtMjYuNzQsMzMuOTU1LTYwLjU1LDMzLjk1NS05Ny4yNzdjMC04Ni4zNzctNzAuMjczLTE1Ni42NS0xNTYuNjUtMTU2LjY1ICAgUzAsODEuMjAzLDAsMTY3LjU4czcwLjI3MywxNTYuNjUsMTU2LjY1LDE1Ni42NWMzOC44MiwwLDc0LjM4MS0xNC4yLDEwMS43NzgtMzcuNjdsMTQ3LjE3NCwxMjcuODUzTDQyNS4zNDMsMzkxLjY4OXogICAgTTE1Ni42NSwzMDQuMjNDODEuMzAxLDMwNC4yMywyMCwyNDIuOTI5LDIwLDE2Ny41OFM4MS4zMDEsMzAuOTMsMTU2LjY1LDMwLjkzYzc1LjM1LDAsMTM2LjY1LDYxLjMwMSwxMzYuNjUsMTM2LjY1ICAgUzIzMiwzMDQuMjMsMTU2LjY1LDMwNC4yM3oiIGZpbGw9IiNGRkZGRkYiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K);\
background-size: 60%;\
background-position: center;\
background-repeat: no-repeat;\
border-left: solid 1px hsl(0, 0%, 13%);\
}\
\
.doc-win-submit:hover {\
background-color: hsl(0, 0%, 20%);\
}\
\
.doc-win-doc {\
width: 100%;\
height: calc(100% - 3.5em);\
border-top: solid 1px hsl(0, 0%, 13%);\
box-sizing: border-box;\
overflow-x: hidden;\
overflow-y: auto;\
}\
.doc-side-cat-title {\
margin-left: 1em;\
color: hsl(0, 0%, 100%);\
font-size: 1.4em;\
font-variant: small-caps;\
}\
.doc-side-item {\
color: hsl(0, 0%, 80%);\
padding: 2px 0;\
padding-left: 2.5em;\
cursor: pointer;\
display: block;\
}\
.doc-side-item:visited {\
color: hsl(0, 0%, 80%);\
}\
.doc-side-item:hover {\
color: white;\
background-color: hsla(0, 0%, 0%, 0.3);\
}\
.doc-doc-cat-title {\
color: white;\
display: flex;\
align-items: center;\
white-space: nowrap;\
font-size: 2em;\
font-variant: small-caps;\
}\
.doc-doc-cat-title:before {\
content: '';\
width: 3em;\
height: 1px;\
margin-right: 1em;\
background-color: hsl(0, 0%, 80%);\
}\
.doc-doc-cat-title:after {\
content: '';\
width: 100%;\
height: 1px;\
margin-left: 1em;\
background-color: hsl(0, 0%, 80%);\
}\
.doc-doc-item {\
border-bottom: solid 1px hsl(0, 0%, 50%);\
margin: 1em 0;\
padding-bottom: 1em;\
}\
.doc-doc-item-title {\
color: white;\
font-size: 1.2em;\
margin: 0 2em;\
padding: 0.5em;\
background-color: hsl(0, 0%, 35%);\
border: solid 1px hsl(0, 0%,40%);\
border-radius: 5px;\
}\
.doc-doc-item-param {\
font-size: 1em;\
}\
.doc-doc-item-returns {\
font-size: 1em;\
}\
.doc-doc-item-desc {\
color: hsl(0, 0%, 80%);\
margin: 0.8em 2.4em;\
}\
.doc-doc-item-returns-title {\
font-size: 1em;\
color: hsl(0, 0%, 90%);\
font-weight: bold;\
margin-left: 2.4em;\
}\
.doc-doc-item-returns-content {\
color: hsl(0, 0%, 80%);\
margin-left: 3.4em;\
}\
.doc-doc-item-param-title {\
font-size: 1em;\
color: hsl(0, 0%, 90%);\
font-weight: bold;\
margin-left: 2.4em;\
}\
.doc-doc-item-value-title {\
font-size: 1em;\
color: hsl(0, 0%, 90%);\
font-weight: bold;\
margin-left: 2.4em;\
display: inline-block;\
}\
.doc-doc-item-value-constant {\
display: inline-block;\
margin-left: 0.6em;\
color: hsl(0, 0%, 80%);\
}\
.doc-doc-item-value-title:after {\
content: ' : ';\
}\
.doc-doc-item-params-content .doc-doc-item-params-first {\
color: hsl(180, 40%, 60%);\
font-weight: bold;\
}\
.doc-doc-item-params-content .doc-doc-item-params-first:after {\
content: ' : ';\
}\
.doc-doc-item-params-content {\
color: hsl(0, 0%, 80%);\
margin-left: 3.4em;\
padding: 0;\
list-style-type: none;\
margin-top: 0;\
margin-bottom: 0.8em;\
}\
.doc-doc-item-title-type {\
color: hsl(180, 70%, 70%);\
display: inline-block;\
margin-right: 0.5em;\
font-weight: bold;\
}\
.doc-doc-item-title-name {\
color: white;\
display: inline-block;\
}\
.doc-doc-item a {\
transition: ease all 0.4s;\
color: hsl(180, 40%, 60%);\
border-bottom: solid 1px transparent;\
}\
.doc-doc-item a:hover {\
border-bottom: solid 1px hsl(180, 40%, 60%);\
}";

	var win, doc, sidebar, inMin, inMax, search, submit;
	var table = [];
	var cat = {};
	var hashTable = {};
	var lang;

	var data = [];
	var catData = {};
	
	function genSymblTable() {
		_.get('lang/get/documentation/fr', function(lg){
			lang = lg.lang;
			_.get('function/get-categories', function(data) {
				for(var i in data.categories) {
					if(!data.categories.hasOwnProperty(i)) continue;
					catData[i] = {
						nb: 0,
						name: 'doc-cat-title-' + data.categories[i].name,
						sideName: 'doc-side-cat-title-' + data.categories[i].name
					};
					cat[i] = data.categories[i].name;
					sidebar.append($(document.createElement('div')).addClass('doc-side-cat').addClass('doc-side-cat-' + i).append(
						$(document.createElement('div')).addClass('doc-side-cat-title').attr('id', 'doc-side-cat-title-' + cat[i]).html(lang['function_category_' + cat[i]])));
					
					doc.append($(document.createElement('div')).addClass('doc-doc-cat').addClass('doc-doc-cat-' + i).attr('id', 'doc-cat-title-' + cat[i]).append(
						$(document.createElement('div')).addClass('doc-doc-cat-title').html(lang['function_category_' + cat[i]])));
				}

				for(var i of LW.functions) {
					if(!hashTable.hasOwnProperty(i.name)) {
						hashTable[i.name] = 0;
					}
					++hashTable[i.name];
					++catData[i.category].nb;
					i.real_name = i.name + ((hashTable[i.name] == 1) ? '' : '_' + hashTable[i.name]);
					$('.doc-doc-cat-' + i.category).first().append(genFuncElement(i));
					
					if(hashTable[i.name] > 1) continue;
					$('.doc-side-cat-' + i.category).first().append($(document.createElement('a')).addClass('doc-side-item').attr('id', 'doc-side-item-' + i.real_name).html(i.name).attr('href', '#doc-doc-' + i.real_name));
				}

				for(var i of LW.constants) {
					if(!hashTable.hasOwnProperty(i.name)) {
						hashTable[i.name] = 0;
					}
					++hashTable[i.name];
					++catData[i.category].nb;
					i.real_name = i.name + ((hashTable[i.name] == 1) ? '' : '_' + hashTable[i.name]);
					$('.doc-doc-cat-' + i.category).first().append(genConstantElement(i));

					if(hashTable[i.name] > 1) continue;
					$('.doc-side-cat-' + i.category).first().append($(document.createElement('a')).addClass('doc-side-item').attr('id', 'doc-side-item-' + i.real_name).html(i.name).attr('href', '#doc-doc-' + i.real_name));
				}

				$('.doc-win a').click(function(e) { e.stopBubbling(); }); // empêche le refresh de la page au click sur un lien

				$('.doc-win code').each(function(index, elem) {
					elem = $(elem);
					elem.addClass('language-js');
					var pre = $(document.createElement('pre')).addClass('language-js').append(elem.clone());
					elem.replaceWith(pre);
					Prism.highlightElement(pre.find('code')[0], $(pre.find('code')[0]).html().length > 10000, function(){});
				});
			});
		});
	}
	
	function trad(item) {
		return lang[item] ? lang[item] : item;
	}
	
	function genFuncElement(func) {
		data.push({
			name: func.real_name,
			id: 'doc-doc-' + func.real_name,
			idSide: 'doc-side-item-' + func.real_name,
			level: func.level,
			cat: func.category
		});

		var element = $(document.createElement('div')).addClass('doc-doc-item').attr('id', 'doc-doc-' + func.real_name);
		var funcValue = $(document.createElement('div')).addClass('doc-doc-item-title');
		var params = $(document.createElement('div')).addClass('doc-doc-item-params');
		var returns = $(document.createElement('div')).addClass('doc-doc-item-returns');
		var description = $(document.createElement('div')).addClass('doc-doc-item-desc')
		.html(lang['func_' + func.real_name] ? lang['func_' + func.real_name].replace(/#[a-zA-Z0-9_]*/g, function(i) {
			return '<a href="#doc-doc-' + i.substr(1) + '">' + i.substr(1) + '</a>';
		}) : '');
		var paramTitle = $(document.createElement('h2')).addClass('doc-doc-item-param-title').html('Paramètres');
		var returnsTitle = $(document.createElement('h2')).addClass('doc-doc-item-returns-title').html('Retourne');
		var returnsContent = $(document.createElement('div')).addClass('doc-doc-item-returns-content')
		.html(lang['func_' + func.real_name + '_return'] ? lang['func_' + func.real_name + '_return'].replace(/#[a-zA-Z0-9_]*/g, function(i) {
			return '<a href="#doc-doc-' + i.substr(1) + '">' + i.substr(1) + '</a>';
		}) : '');
		var paramContent = $(document.createElement('ul')).addClass('doc-doc-item-params-content');
		
		funcValue.html(funcValue.html() + func.name + '(');
		var sz = func.arguments_types.length - 1;
		for(var i in func.arguments_types) {
			if(func.arguments_types.hasOwnProperty(i)) {
				(function() {
					var type = $(document.createElement('div')).addClass('doc-doc-item-title-type').html(lang['arg_type_' + func.arguments_types[i]] ? lang['arg_type_' + func.arguments_types[i]] : '?');
					var name = $(document.createElement('div')).addClass('doc-doc-item-title-name').html(func.arguments_names[i]);
					funcValue.append(type);
					funcValue.append(name);
					if(i != sz) {
						funcValue.html(funcValue.html() + ', ');
					}
					var first = $(document.createElement('span')).addClass('doc-doc-item-params-first').html(func.arguments_names[i]);
					var desc = $(document.createElement('li')).append(first).append(lang['func_' + func.real_name + '_arg_' + (parseInt(i)+1)] ? lang['func_' + func.real_name + '_arg_' + (parseInt(i)+1)].replace(/#[a-zA-Z0-9_]*/g, function(i) {
						return '<a href="#doc-doc-' + i.substr(1) + '">' + i.substr(1) + '</a>';
					}) : '');
					paramContent.append(desc);
				})();
			}
		}
		funcValue.html(funcValue.html() + ')');
		
		if(func.return_type != 0) {
			var type = $(document.createElement('div')).addClass('doc-doc-item-title-type').html(lang['arg_type_' + func.return_type] ? lang['arg_type_' + func.return_type] : '?');
			var name = $(document.createElement('div')).addClass('doc-doc-item-title-name').html(func.return_name);
			funcValue.html(funcValue.html() + ' &#10140; ');
			funcValue.append(type);
			funcValue.append(name);
		}
		
		params.append(paramTitle);
		params.append(paramContent);
		returns.append(returnsTitle);
		returns.append(returnsContent);
		element.append(funcValue);
		element.append(description);
		element.append(params);
		element.append(returns);
		
		return element;
	}
	
	function genConstantElement(constant) {		
		data.push({
			name: constant.real_name,
			id: 'doc-doc-' + constant.real_name,
			idSide: 'doc-side-item-' + constant.real_name,
			level: 1,
			cat: constant.category
		});

		var element = $(document.createElement('div')).addClass('doc-doc-item').attr('id', 'doc-doc-' + constant.real_name);
		var constantValue = $(document.createElement('div')).addClass('doc-doc-item-title');
		var description = $(document.createElement('div')).addClass('doc-doc-item-desc').html(lang['const_' + constant.real_name] ? lang['const_' + constant.real_name].replace(/#[a-zA-Z0-9_]*/g, function(i) {
			return '<a href="#doc-doc-' + i.substr(1) + '">' + i.substr(1) + '</a>';
		}) : '');		
		var constantIdTitle = $(document.createElement('h2')).addClass('doc-doc-item-value-title').html('Valeur');
		var constantIdConstant = $(document.createElement('div')).addClass('doc-doc-item-value-constant').html(constant.value);

		constantValue.html(constant.name);
		
		element.append(constantValue);
		element.append(description);
		element.append(constantIdTitle);
		element.append(constantIdConstant);

		return element;
	}
	
	var style = $(document.createElement('style')).attr('type', 'text/css').html(cssCode);
	document.head.appendChild(style[0]);
	
	
	function genDocWindow() {
		if(win) return;
		win = $(document.createElement('div')).addClass('doc-win').addClass('doc-hide');
		var header = $(document.createElement('div')).addClass('doc-win-header');
		var close = $(document.createElement('div')).addClass('doc-win-close').html('×');
		var leftTitle = $(document.createElement('h2')).html('Documentation');
		var title = $(document.createElement('div')).addClass('doc-win-title');
		
		var core = $(document.createElement('div')).addClass('doc-win-core');
		sidebar = $(document.createElement('div')).addClass('doc-win-sidebar');
		var viewport = $(document.createElement('div')).addClass('doc-win-viewport');
		var searchBox = $(document.createElement('div')).addClass('doc-win-search');
		inMin = $(document.createElement('input')).addClass('doc-win-min').attr('required', true).attr('type', 'text');
		inMax = $(document.createElement('input')).addClass('doc-win-max').attr('required', true).attr('type', 'text');
		var labelMin = $(document.createElement('label')).addClass('doc-win-label-min').html('Min');
		var labelMax = $(document.createElement('label')).addClass('doc-win-label-max').html('Max');
		search = $(document.createElement('input')).addClass('doc-win-searchbar').attr('placeholder', 'Rechercher...').attr('type', 'text');
		submit = $(document.createElement('div')).addClass('doc-win-submit');
		doc = $(document.createElement('div')).addClass('doc-win-doc');
		
		header.append(close);
		header.append(leftTitle);
		header.append(title);
		
		searchBox.append(inMin);
		searchBox.append(labelMin);
		searchBox.append(inMax);
		searchBox.append(labelMax);
		searchBox.append(search);
		searchBox.append(submit);
		
		viewport.append(searchBox);
		viewport.append(doc);
		
		core.append(sidebar);
		core.append(viewport);
		
		win.append(header);
		win.append(core);
				
		document.addEventListener('keydown', function(e) {
			if(e.altKey && e.ctrlKey && e.keyCode == 68) {
				win.toggleClass('doc-hide');
			}
		});
		
		close[0].addEventListener('click', function() {
			win.toggleClass('doc-hide');
		});

		$(searchBox.find('input')).bind('keyup', function() {
			regenWorker(function(data) {
				data = data.data;
				var tmp;
				for(var i in data) {
					if(data.hasOwnProperty(i)) {
						tmp = document.getElementById(i);
						if(tmp) {
							tmp.style.display = data[i] ? 'block' : 'none';
						}
					}
				}
			});
			ww.postMessage({
				data: data,
				cat: catData,
				min: inMin.val().replace(/[ \t]/g, '').length > 0 ? parseInt(inMin.val()) : 1,
				max: inMax.val().replace(/[ \t]/g, '').length > 0 ? parseInt(inMax.val()) : 301,
				query: search.val()
			});
		});

		
		genSymblTable();
		
		document.body.appendChild(win[0]);
	}
	
	// récupération des différentes catégories : _.get('function/get-categories', function(data) {console.log(data);})
	// fonctions : LW.functions
	// constantes : LW.constants
	

	LW.on('pageload', genDocWindow);


	/* http://prismjs.com/download.html?themes=prism&languages=clike+javascript */
	var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(){var e=/\blang(?:uage)?-(\w+)\b/i,t=0,n=_self.Prism={util:{encode:function(e){return e instanceof a?new a(e.type,n.util.encode(e.content),e.alias):"Array"===n.util.type(e)?e.map(n.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++t}),e.__id},clone:function(e){var t=n.util.type(e);switch(t){case"Object":var a={};for(var r in e)e.hasOwnProperty(r)&&(a[r]=n.util.clone(e[r]));return a;case"Array":return e.map&&e.map(function(e){return n.util.clone(e)})}return e}},languages:{extend:function(e,t){var a=n.util.clone(n.languages[e]);for(var r in t)a[r]=t[r];return a},insertBefore:function(e,t,a,r){r=r||n.languages;var l=r[e];if(2==arguments.length){a=arguments[1];for(var i in a)a.hasOwnProperty(i)&&(l[i]=a[i]);return l}var o={};for(var s in l)if(l.hasOwnProperty(s)){if(s==t)for(var i in a)a.hasOwnProperty(i)&&(o[i]=a[i]);o[s]=l[s]}return n.languages.DFS(n.languages,function(t,n){n===r[e]&&t!=e&&(this[t]=o)}),r[e]=o},DFS:function(e,t,a,r){r=r||{};for(var l in e)e.hasOwnProperty(l)&&(t.call(e,l,e[l],a||l),"Object"!==n.util.type(e[l])||r[n.util.objId(e[l])]?"Array"!==n.util.type(e[l])||r[n.util.objId(e[l])]||(r[n.util.objId(e[l])]=!0,n.languages.DFS(e[l],t,l,r)):(r[n.util.objId(e[l])]=!0,n.languages.DFS(e[l],t,null,r)))}},plugins:{},highlightAll:function(e,t){var a={callback:t,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};n.hooks.run("before-highlightall",a);for(var r,l=a.elements||document.querySelectorAll(a.selector),i=0;r=l[i++];)n.highlightElement(r,e===!0,a.callback)},highlightElement:function(t,a,r){for(var l,i,o=t;o&&!e.test(o.className);)o=o.parentNode;o&&(l=(o.className.match(e)||[,""])[1],i=n.languages[l]),t.className=t.className.replace(e,"").replace(/\s+/g," ")+" language-"+l,o=t.parentNode,/pre/i.test(o.nodeName)&&(o.className=o.className.replace(e,"").replace(/\s+/g," ")+" language-"+l);var s=t.textContent,u={element:t,language:l,grammar:i,code:s};if(!s||!i)return n.hooks.run("complete",u),void 0;if(n.hooks.run("before-highlight",u),a&&_self.Worker){var c=new Worker(n.filename);c.onmessage=function(e){u.highlightedCode=e.data,n.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,r&&r.call(u.element),n.hooks.run("after-highlight",u),n.hooks.run("complete",u)},c.postMessage(JSON.stringify({language:u.language,code:u.code,immediateClose:!0}))}else u.highlightedCode=n.highlight(u.code,u.grammar,u.language),n.hooks.run("before-insert",u),u.element.innerHTML=u.highlightedCode,r&&r.call(t),n.hooks.run("after-highlight",u),n.hooks.run("complete",u)},highlight:function(e,t,r){var l=n.tokenize(e,t);return a.stringify(n.util.encode(l),r)},tokenize:function(e,t){var a=n.Token,r=[e],l=t.rest;if(l){for(var i in l)t[i]=l[i];delete t.rest}e:for(var i in t)if(t.hasOwnProperty(i)&&t[i]){var o=t[i];o="Array"===n.util.type(o)?o:[o];for(var s=0;s<o.length;++s){var u=o[s],c=u.inside,g=!!u.lookbehind,h=!!u.greedy,f=0,d=u.alias;u=u.pattern||u;for(var p=0;p<r.length;p++){var m=r[p];if(r.length>e.length)break e;if(!(m instanceof a)){u.lastIndex=0;var y=u.exec(m),v=1;if(!y&&h&&p!=r.length-1){var b=r[p+1].matchedStr||r[p+1],k=m+b;if(p<r.length-2&&(k+=r[p+2].matchedStr||r[p+2]),u.lastIndex=0,y=u.exec(k),!y)continue;var w=y.index+(g?y[1].length:0);if(w>=m.length)continue;var _=y.index+y[0].length,P=m.length+b.length;if(v=3,P>=_){if(r[p+1].greedy)continue;v=2,k=k.slice(0,P)}m=k}if(y){g&&(f=y[1].length);var w=y.index+f,y=y[0].slice(f),_=w+y.length,S=m.slice(0,w),O=m.slice(_),j=[p,v];S&&j.push(S);var A=new a(i,c?n.tokenize(y,c):y,d,y,h);j.push(A),O&&j.push(O),Array.prototype.splice.apply(r,j)}}}}}return r},hooks:{all:{},add:function(e,t){var a=n.hooks.all;a[e]=a[e]||[],a[e].push(t)},run:function(e,t){var a=n.hooks.all[e];if(a&&a.length)for(var r,l=0;r=a[l++];)r(t)}}},a=n.Token=function(e,t,n,a,r){this.type=e,this.content=t,this.alias=n,this.matchedStr=a||null,this.greedy=!!r};if(a.stringify=function(e,t,r){if("string"==typeof e)return e;if("Array"===n.util.type(e))return e.map(function(n){return a.stringify(n,t,e)}).join("");var l={type:e.type,content:a.stringify(e.content,t,r),tag:"span",classes:["token",e.type],attributes:{},language:t,parent:r};if("comment"==l.type&&(l.attributes.spellcheck="true"),e.alias){var i="Array"===n.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(l.classes,i)}n.hooks.run("wrap",l);var o="";for(var s in l.attributes)o+=(o?" ":"")+s+'="'+(l.attributes[s]||"")+'"';return"<"+l.tag+' class="'+l.classes.join(" ")+'" '+o+">"+l.content+"</"+l.tag+">"},!_self.document)return _self.addEventListener?(_self.addEventListener("message",function(e){var t=JSON.parse(e.data),a=t.language,r=t.code,l=t.immediateClose;_self.postMessage(n.highlight(r,n.languages[a],a)),l&&_self.close()},!1),_self.Prism):_self.Prism;var r=document.currentScript||[].slice.call(document.getElementsByTagName("script")).pop();return r&&(n.filename=r.src,document.addEventListener&&!r.hasAttribute("data-manual")&&document.addEventListener("DOMContentLoaded",n.highlightAll)),_self.Prism}();"undefined"!=typeof module&&module.exports&&(module.exports=Prism),"undefined"!=typeof global&&(global.Prism=Prism);
	Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\w\W]*?\*\//,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0}],string:{pattern:/(["'])(\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/i,lookbehind:!0,inside:{punctuation:/(\.|\\)/}},keyword:/\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,"boolean":/\b(true|false)\b/,"function":/[a-z0-9_]+(?=\()/i,number:/\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,operator:/--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,punctuation:/[{}[\];(),.:]/};
	Prism.languages.javascript=Prism.languages.extend("clike",{keyword:/\b(break|continue|do|else|for|function|if|in|null|return|var|global|while)\b/,number:/\b-?(0x[\dA-Fa-f]+|0b[01]+|0o[0-7]+|\d*\.?\d+([Ee][+-]?\d+)?|NaN|Infinity)\b/,"function":/[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*(?=\()/i}),Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:/(^|[^\/])\/(?!\/)(\[.+?]|\\.|[^\/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,lookbehind:!0,greedy:!0}}),Prism.languages.insertBefore("javascript","class-name",{"template-string":{pattern:/`(?:\\\\|\\?[^\\])*?`/,greedy:!0,inside:{interpolation:{pattern:/\$\{[^}]+\}/,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:Prism.languages.javascript}},string:/[\s\S]+/}}}),Prism.languages.markup&&Prism.languages.insertBefore("markup","tag",{script:{pattern:/(<script[\w\W]*?>)[\w\W]*?(?=<\/script>)/i,lookbehind:!0,inside:Prism.languages.javascript,alias:"language-javascript"}}),Prism.languages.js=Prism.languages.javascript;

	var prismCSS = 'code[class*="language-"],\
		pre[class*="language-"] {\
			color: hsl(0, 0%, 80%);\
			background: none;\
			font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace;\
			text-align: left;\
			white-space: pre;\
			word-spacing: normal;\
			word-break: normal;\
			word-wrap: normal;\
			line-height: 1.5;\
			-moz-tab-size: 4;\
			-o-tab-size: 4;\
			tab-size: 4;\
			-webkit-hyphens: none;\
			-moz-hyphens: none;\
			-ms-hyphens: none;\
			hyphens: none;\
		}\
		pre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,\
		code[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {\
			text-shadow: none;\
			background: #b3d4fc;\
		}\
		pre[class*="language-"]::selection, pre[class*="language-"] ::selection,\
		code[class*="language-"]::selection, code[class*="language-"] ::selection {\
			text-shadow: none;\
			background: #b3d4fc;\
		}\
		@media print {\
			code[class*="language-"],\
			pre[class*="language-"] {\
				text-shadow: none;\
			}\
		}\
		/* Code blocks */\
		pre[class*="language-"] {\
			padding: 1em;\
			margin: .5em 0;\
			overflow: auto;\
		}\
		:not(pre) > code[class*="language-"],\
		pre[class*="language-"] {\
			background-color: hsl(0, 0%, 35%);\
			border: solid 1px hsl(0, 0%,40%);\
		}\
		/* Inline code */\
		:not(pre) > code[class*="language-"] {\
			padding: .1em;\
			border-radius: .3em;\
			white-space: normal;\
		}\
		.token.comment,\
		.token.prolog,\
		.token.doctype,\
		.token.cdata {\
			color: hsl(0, 0%, 60%);\
			font-style: italic;\
		}\
		.token.punctuation {\
			color: #999;\
		}\
		.namespace {\
			opacity: .7;\
		}\
		.token.property,\
		.token.tag,\
		.token.boolean,\
		.token.number,\
		.token.constant,\
		.token.symbol,\
		.token.deleted {\
			color: hsl(160, 80%, 80%);\
			font-weight: bold;\
		}\
		.token.selector,\
		.token.attr-name,\
		.token.string,\
		.token.char,\
		.token.builtin,\
		.token.inserted {\
			color: hsl(150, 50%, 90%);\
		}\
		.token.operator,\
		.token.entity,\
		.token.url,\
		.language-css .token.string,\
		.style .token.string {\
			color: white;\
		}\
		.token.atrule,\
		.token.attr-value,\
		.token.keyword {\
			color: hsl(180, 70%, 70%);\
			font-weight: bold;\
		}\
		.token.function {\
			color: hsl(180, 50%, 70%);\
		}\
		.token.regex,\
		.token.important,\
		.token.variable {\
			color: #e90;\
		}\
		.token.important,\
		.token.bold {\
			font-weight: bold;\
		}\
		.token.italic {\
			font-style: italic;\
		}\
		.token.entity {\
			cursor: help;\
		}';

		var prismStyle = $(document.createElement('style')).attr('type', 'text/css').html(prismCSS);
		document.head.appendChild(prismStyle[0]);

		function workerFunc() {
			onmessage = function(data) {
				data = data.data;
				var answer = {};
				var reg = new RegExp('.*' + data.query + '.*', 'i');
				for(var i = 0; i < data.data.length; ++i) {
					if(reg.test(data.data[i].name) && data.data[i].level >= data.min && data.data[i].level <= data.max) {
						answer[data.data[i].id] = true;
						answer[data.data[i].idSide] = true;
					}
					else {
						answer[data.data[i].id] = false;
						answer[data.data[i].idSide] = false;
						data.cat[data.data[i].cat].nb--;
					}
				}

				for(var i in data.cat) {
					if(data.cat.hasOwnProperty(i)) {
						answer[data.cat[i].name] = data.cat[i].nb != 0;
						answer[data.cat[i].sideName] = data.cat[i].nb != 0;
					}
				}

				postMessage(answer);
			};
		}

		function regenWorker(func) {
			ww.terminate();
			ww = new Worker(blob);
			ww.onmessage = func;
		}

	var blob = URL.createObjectURL(new Blob([
		'(', workerFunc, ')()'], {type: 'application/javascript'}));
	var ww = new Worker(blob);
		
})();