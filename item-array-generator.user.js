// 1) On récupère tous les items
// 2) On regarde chaque items et on le met dans un tableau

// format du tableau : 
/*
	%weapons% <-> toutes les armes
	%area-weapons% <-> toutes les armes qui ont une AoE
	%inline-weapons% <-> toutes les armes qui sont inline
	%contact-weapons% <-> toutes les armes type katana
	%non-obstacle-weapons% <-> toutes les armes qui peuvent passer à travers les obstacles
	%poison-weapons% <-> toutes les armes qui dealent du poison
	%to-obstacle-weapons% <-> les armes ayant un effet jusqu'à un obstacle (genre laser)
	
	%chips% <-> toutes les chips
	%damage-chips% <-> toutes les chips d'attaque (sauf poison)
	%poison-chips% <-> toutes les chips de poison
	%heal-chips% <-> toutes les chips de heal
	%shield-chips% <-> toutes les chips d'armure
	%boost-chips% <-> toutes les chips de boost
	%bulb-chips% <-> toutes les chips de bulbes
	%debuf-chips% <-> toutes les chips de debuf
	%tactic-chips% <-> toutes les chips tactiques (les grises)
	%mirror-chips% <-> toutes les chips mirroir
	%area-chips% <-> toutes les chips avec une AoE
	%contact-chips% <-> toutes les chips de contact
	%inline-chips% <-> toutes les chips inline
	%non-obstacle-chips% <-> toutes les puces qui peuvent passer à travers les obstacles
	%to-obstacle-chips% <-> les chips ayant un effet jusqu'à un obstacle (genre laser)
	
	%CHIP_ICEBERG% <-> la chip iceberg (marche pour toutes les armes et chips)
	
	chaque %...% est un tableau. Pour ajouter, soustraire, intersecter, unioner (ça se dit...)
	il y'a les opérateur : 
	+ <-> ajoute 2 tableaux (genre %chips% + %weapons% : les chips et les armes dans un tableau)
	- <-> soustrait un tableau à un autre (genre %chips% - %inline-chips% : les chips sauf les inline)
	& <-> intersection de 2 tableaux (genre %inline-chips% & %area-chips% : toutes les chips inline ayant une AoE)
	
	possible de parenthéser tout ça pour avoir des trucs plus complexes : 
	(%inline-weapons% + %inline-chips%) - (%contact-weapons% + %contact-chips%)
	
	Pour le format du tableau, deux possibilités : 
	1) tableau associatif : 
		{
			"index": "%...% + %...%",
			"autre-index": {
				"sous-index": "%...%": [],
			},
			"encore-un": "%...%": [],
		}
	2) tableau indexé : 
		[
			"%...%",
			"%...% - %...%",
			[
				"%...%": [],
			],
			"%...%": [],
		]
	3) Possible de mettre de mélanger les deux : 
	{
		"index": [
			"%...%", "%...%": [],
		],
		"autre": {
			"nom": "%...%": [],
		}
	}
*/

// structure par défaut
var structure = {
	"chips": {
		"damage": "%damage-chips%",
		"heal": "%heal-chips%",
	},
	"weapons": "%weapons%",
	"test": "(%chips% + %weapons%) - (%inline-weapons% + %inline-chips%",
};

/***********************************
************************************
***********************************/

var items = {
	"%weapons%": {},
	"%area-weapons%": {},
	"%inline-weapons%": {},
	"%contact-weapons%": {},
	"%non-obstacle-weapons%": {},
	"%to-obstacle-weapons%": {},
	"%chips%": {},
	"%area-chips%": {},
	"%inline-chips%": {},
	"%contact-chips%": {},
	"%non-obstacle-chips%": {},
	"%to-obstacle-chips%": {}
}

// il est possible de rajouter des effets si ceux la ne convienne pas ou si vous voulez affiner
// il suffit de modifier la valeur entre quotes
// cela pourra ensuite être utilisé via %votreValeur-chips% et %votreValeur-weapons%, et renverra le tableau des chips
// et weapons ayant cet effet

var effects = {
	4:  'buff', // buff agility
	3:  'buff', // buff force
	7:  'buff', // buff MP
	21: 'buff', // buff resistance
	3:  'buff', // buff strength
	8:  'buff', // buff TP
	22: 'buff', // buff wisdom
	2:  'heal', // heal
	12: 'heal', // boost max life
	16: 'damage', // kill (pour les bulbes alliés)
	1:  'damage', // damage
	13: 'poison', // poison
	5:  'shield', // relative shield
	6:  'shield', // absolute shield
	15: 'heal', // resurrect
	24: 'debuff', // debuff magie
	17: 'debuff', // debuff MP
	19: 'debuff', // debuff force
	18: 'debuff', // debuff TP
	14: 'bulb', // summon
	10: 'tactic', // teleport
	23: 'tactic', // antidote
	9:  'tactic', // debuff
	11: 'tactic', // invert
	20: 'mirror', // damage return

};

// initialisation des effets
for(var i in effects) {
	var seen = {};
	if(effects.hasOwnProperty(i)) {
		if(!seen[effects[i]]) {
			seen[effects[i]] = true;
			items['%' + effects[i] + '-chips%'] = {};
			items['%' + effects[i] + '-weapons%'] = {};
		}
	}
}

function getItems(callback) {
	_.get('chip/get-all', function(data) {
		if(data.error) {
			// meh :(
			return;
		}

		_.get('weapon/get-all', function(data2) {
			if(data.error) {
				return;
			}
			var items = [];
			for(var i in data.chips) {
				data.chips[i].type = "chip";
				items.push(data.chips[i]);
			}

			for(var i in data2.weapons) {
				data2.weapons[i].type = "weapon";
				items.push(data2.weapons[i]);
			}

			callback(items);
		});

	});
}

getItems(function(it) {
	for(var i in it) {
		if(it.hasOwnProperty(i)) {
			var current = it[i];
			items['%' + current.type.toUpperCase() + '_' + current.name.toUpperCase() + '%'] = {current.id:current};

			// %chips% || %weapons%
			items['%' + current.type + 's%'][current.id] = current;
			if(current.area > 2)
				items['%area-' + current.type + 's%'][current.id] = current;
			if(current.area == 2)
				items['%to-obstacle-' + current.type + 's%'][current.id] = current;
			if(current.launch_type === 0)
				items['%inline-' + current.type + 's%'][current.id] = current;
			if(current.min_range === 1 && current.max_range === 1)
				items['%contact-' + current.type + 's%'][current.id] = current;
			if(current.los === 0)
				items['%non-obstacle-' + current.type + 's%'][current.id] = current;

			// on regarde les effets
			var seen = {};
			for(var i = 0; i < current.effects.length; ++i) {
				if(!seen[effects[current.effects[i].id]]) {
					seen[effects[current.effects[i].id]] = true;
					items['%' + effects[current.effects[i].id] + '-' + current.type + 's%'][current.id] = current;
				}
			}
		}
	}

	buildStructure(items);
});

function buildStructure(it) {

}

function resolve(str) {
	// (a + (b + c)) + (e + y) + r
}
/*
area: 1
cooldown: 0
cost: 4
effects: Array[1]
id: 2
initial_cooldown: 0
launch_type: 1
level: 9
los: 1
max_range: 8
min_range: 0
name: "ice"
team_cooldown: 0
template: 15
type:


efects:
id,value1,value2,turns,targets
*/