/**
*	Génère les items pour le wiki
*	à copier coller dans la console
**/

_.get('market/get-item-templates/$', function(data) {});
items : [
	{
		farmer_count,
		id, // identifiant de l'item
		leek_count,
		level, // niveau pour le posséder
		name, // nom de la constante en minuscule
		price_crystals, // prix en crystaux (0 si non achetable avec les crystaux)
		price_habs, // prix en habs
		sell_price, // prix à la revente
		type, // 1 : arme, 2: chips, potion: 3, 4: hats
	}
]

Data récupérables via LW.weapons
{
	id: {
		area, // AoE (1 = pas d'AoE)
		cost, // nb de TPs
		id, // id de l'objet
		launch_type, // inline: 0, full:1
		level, // level
		los, // 1:pistol
		max_range,
		min_range,
		name, // nom à utiliser pour la traduction
		effects: [
			{
				id,
				targets: // valeur binaire
				turns, // durée de l'effet
				value1, // degat min
				value2, // degatMax - degatMin
			}
		]

	}
}

// génération du template
_.lang.get('weapon', template.name) // s'appelle avec le nom anglais (pistol)
_.lang.get('effect', 'level_n', template.level)



var items = [];

_.get('market/get-item-templates/$', function(data) {
	for(item of data.items) {
		genTemplate(item);
	}
});

function genTemplate(item) {
	var tmp = {
		name: '',
		level: ,
		constant: ,
		image: ,
		min: , // portée min
		max: , // portée max
		cooldown: ,
		inline: , // présent uniquement si true
		noLoS: ,  // idem
		tp: ,
		zone: , // présent si supérieur à 0
		buy: ,
		sell: ,
		effects: ,
	};

	var sub = LW[item.type == 1 ? "weapons" : "chips"][item.id];

	if(item.type > 2) return;
	tmp.type = item.type;
	tmp.level = item.level;
	tmp.constant = item.name.toUpperCase();
	tmp.buy = item.price_habs;
	tmp.sell = item.sell_price;
	tmp.name = _.lang.get((item.type == 1 ? "weapon" : "chip"), sub.name);
	tmp.image = 'http://leekwars.com/static/image/' + (item.type == 1 ? "weapon" : "chip") + '/' + sub.name + '.png';
	tmp.min = sub.min_range;
	tmp.max = sub.max_range;
	tmp.inline = sub.launch_type == 0;
	tmp.noLoS = sub.los == 0;
	tmp.tp = sub.cost;
	tmp.zone = sub.area - 1;
	tmp.cooldown = (item.type == 1) ? 0 : sub.cooldown;
}