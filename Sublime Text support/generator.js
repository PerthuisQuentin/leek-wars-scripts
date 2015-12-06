/*
*	Génère le fichier d'autocompletion du leekscript
*	Par Twilight
*/

if(LW.functions === undefined) {
	alert('Merci de n\'utiliser ce script que sur le site leekwars.com ou d\'attendre que la page soit chargée avant de l\'utiliser');
	//return;
}

var file = '{\n\t"scope": "source.ls",\n\t"completions":\n\t[\n';
for(var i = 0; i < LW.functions.length; ++i) {
	file += '\t\t{ "trigger": "';
	var trig = LW.functions[i].name + '(';
	var cont = trig;
	for(var j = 0; j < LW.functions[i].arguments_names.length; ++j) {
		trig += LW.functions[i].arguments_names[j] + ((j !== LW.functions[i].arguments_names.length - 1) ? ', ' : '');
		cont += '${' + (j+1) + ':' + LW.functions[i].arguments_names[j] + '}' + ((j !== LW.functions[i].arguments_names.length - 1) ? ', ' : '');
	}
	trig += ')';
	cont += ')';
	file += trig + '", "contents": "' + cont + '" },\n';
}

for(var i = 0; i < LW.constants.length; ++i) {
	file += '\t\t{ "trigger": "' + LW.constants[i].name + '", "contents": "' + LW.constants[i].name + '" },\n';
}

file += '\t\t{ "trigger": "for", "contents": "for(var i = 0; i < ${1:}; ++i) {\\n\\t\\n}" },\n' + 
		'\t\t{ "trigger": "for in", "contents": "for(var i in ${1:}) {\\n\\t\\n}" },\n' + 
		'\t\t{ "trigger": "while", "contents": "while(${1:}) {\\n\\t\\n}" },\n' + 
		'\t\t{ "trigger": "do while", "contents": "do {\\n\\t\\n}  while(${1:});" },\n' + 
		'\t\t{ "trigger": "lama()", "contents": "lama()" }';
file += '\t]\n}\n';

var disp = $(document.createElement('textarea')).text(file).css({
	'position': 'absolute',
	'left': '0',
	'top': '0',
	'width': $(document).outerWidth() + 'px',
	'height': $(document).outerHeight() + 'px',
	'z-index': '50000',
}).appendTo($('body'));