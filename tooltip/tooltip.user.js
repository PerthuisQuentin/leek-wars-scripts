var cssCode = '\
.adv-tooltip {\
width: 300px;\
height: 200px;\
background-color: red;\
position: fixed;\
z-index: 10000;\
}';


var style = $(document.createElement('style')).attr('type', 'text/css').html(cssCode);
document.head.appendChild(style[0]);

/* éléments à sélectionner :
	- Liens :
		- vers un farmer
		- vers un leek
		- vers une équipe
		- vers un combat
	- Leek, farmer, teams :
		- dans le potager

  élements à ne pas sélectionner :
  	- Liens :
  		- si dans la barre latérale de gauche
  	- Leek, farmer, teams :
  		- dans le potager. Notre team
*/
document.addEventListener('mouseover', function(e) {
	// selection de tous les liens et item de classe 'enemy'
	var target = e.target.closest('a, .enemy');
	if(!target) return;
	// filtre de la barre latérale droite
	if(target.closest('#menu')) return;

	// récupération de la cible
	var type, id;
	if(target.tagName === 'A') {
		var tmp = target.href.match(/https?:\/\/leekwars\.com\/(farmer|leek|team|tournament|fight)\/(\d+)/);
		if(tmp === null) return;
		type = tmp[1];
		id = tmp[2];
	}
	else { // .enemy
		var tmp = target.className.match(/(leek|team|farmer)/);
		if(tmp === null) return;
		type = tmp[1];
		id = target.id;
	}

	// génération de l'instance de pop-in
	var mary = new PopIn(target, type, id);
});

var delay = 200;
function PopIn(target, type, id) {
	var over = true;
	var opened = false;
	var aborted = false;
	var that = this;
	var element;

	var targetMouseoutListener = function() {
		aborted = true;
		target.removeEventListener('mouseout', targetMouseoutListener);
		target.removeEventListener('mouseover', targetMouseoutListener);
	};

	// attent le délai nécéssaire à l'ouverture de la pop-in. Si le lien est quitté, annule
	this.waitDelay = function(delay) {
		target.addEventListener('mouseout', targetMouseoutListener);
		setTimeout(function() {
			if(!opened && !aborted) {
				opened = true;
				that.load();
				console.log('chargement...');
			}
			else {
				console.log('aborté');
			}
		}, delay);
	};

	// charge les informations nécessaires puis affiche la popin
	this.load = function() {
		this.genPopIn();
		element.addEventListener('mouseout', this.close);
		target.addEventListener('mouseout', this.close);
	};

	// génère la structure de la popin
	this.genPopIn = function() {
		element = document.createElement('div');
		element.classList.add('adv-tooltip');
		
		document.body.appendChild(element);
		this.setPos();
	};

	this.setPos = function() {
		var tmp = target.getBoundingClientRect();
		element.style.left = tmp.left + 'px';
		var top = tmp.top - element.offsetHeight;
		if(top < 0) {
			top = tmp.top + target.offsetHeight;
		}
		element.style.top = top + 'px';
	}

	// génère le layout de la popin
	this.genLayout = function() {

	};

	// rempli la pop-in avec les informations reçues
	this.fill = function(data) {

	};

	this.close = function() {
		if(!opened) return;
		aborted = false;
		target.addEventListener('mouseover', targetMouseoutListener);
		element.addEventListener('mouseover', targetMouseoutListener);
		setTimeout(function() {
			if(!aborted) {
				document.body.removeChild(element);
				opened = false;
			}
		}, 50);
	}

	this.waitDelay(delay);
}