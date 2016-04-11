// ==UserScript==
// @name          [Leek Wars] Doc everywhere
// @namespace     https://github.com/Ebatsin/Leek-Wars/
// @version       0.2
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
height: 100%;\
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
	
	function genSymblTable() {
		_.get('lang/get/documentation/fr', function(lg){
			lang = lg.lang;
			_.get('function/get-categories', function(data) {
				for(var i in data.categories) {
					if(!data.categories.hasOwnProperty(i)) continue;
					cat[i] = data.categories[i].name;
					sidebar.append($(document.createElement('div')).addClass('doc-side-cat').addClass('doc-side-cat-' + i).append(
						$(document.createElement('div')).addClass('doc-side-cat-title').html(lang['function_category_' + cat[i]])));
					
					doc.append($(document.createElement('div')).addClass('doc-doc-cat').addClass('doc-doc-cat-' + i).append(
						$(document.createElement('div')).addClass('doc-doc-cat-title').html(lang['function_category_' + cat[i]])));
				}

				for(var i of LW.functions) {
					if(!hashTable.hasOwnProperty(i.name)) {
						hashTable[i.name] = 0;
					}
					++hashTable[i.name];
					i.real_name = i.name + ((hashTable[i.name] == 1) ? '' : '_' + hashTable[i.name]);
					$('.doc-doc-cat-' + i.category).first().append(genFuncElement(i));
					
					if(hashTable[i.name] > 1) continue;
					$('.doc-side-cat-' + i.category).first().append($(document.createElement('a')).addClass('doc-side-item').html(i.name).attr('href', '#doc-doc-' + i.real_name));
				}

				for(var i of LW.constants) {
					if(!hashTable.hasOwnProperty(i.name)) {
						hashTable[i.name] = 0;
					}
					++hashTable[i.name];
					i.real_name = i.name + ((hashTable[i.name] == 1) ? '' : '_' + hashTable[i.name]);
					$('.doc-doc-cat-' + i.category).first().append(genConstantElement(i));

					if(hashTable[i.name] > 1) continue;
					$('.doc-side-cat-' + i.category).first().append($(document.createElement('a')).addClass('doc-side-item').html(i.name).attr('href', '#doc-doc-' + i.real_name));
				}
			});
		});
	}
	
	function trad(item) {
		return lang[item] ? lang[item] : item;
	}
	
	function genFuncElement(func) {
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
		var element = $(document.createElement('div')).addClass('doc-doc-item').attr('id', 'doc-doc-' + constant.real_name);
		var constantValue = $(document.createElement('div')).addClass('doc-doc-item-title');
		var description = $(document.createElement('div')).addClass('doc-doc-item-desc').html(lang['const_' + constant.real_name] ? lang['const_' + constant.real_name].replace(/#[a-zA-Z0-9_]*/g, function(i) {
			return '<a href="#doc-doc-' + i.substr(1) + '">' + i.substr(1) + '</a>';
		}) : '');

		constantValue.html(constant.name);
		
		element.append(constantValue);
		element.append(description);

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
		
		//viewport.append(searchBox);
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
		
		genSymblTable();
		
		document.body.appendChild(win[0]);
	}
	
	// récupération des différentes catégories : _.get('function/get-categories', function(data) {console.log(data);})
	// fonctions : LW.functions
	// constantes : LW.constants
	

	LW.on('pageload', genDocWindow);
	
})();