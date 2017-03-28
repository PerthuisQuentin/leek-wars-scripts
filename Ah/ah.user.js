// ==UserScript==
// @name         [Leek Wars] Ah !
// @namespace    https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @version      0.1
// @description  Déclenche un "Ah !" sonore lors d'un "Ah !" dans le chat
// @author       TheTintin
// @projectPage   https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @downloadURL   https://github.com/PerthuisQuentin/Leek-Wars-Scripts/raw/master/Ah/ah.js
// @updateURL     https://github.com/PerthuisQuentin/Leek-Wars-Scripts/raw/master/Ah/ah.js
// @match         *://*.leekwars.com/*
// ==/UserScript==

(function() {
    'use strict';

    LW.on('pageload', function() {
        var audio = new Audio('https://raw.githubusercontent.com/PerthuisQuentin/Leek-Wars-Scripts/master/Ah/ah.wav');
        var next = LW.chat.receive;

        LW.chat.receive = function(data) {
            if(data[3] === "Ah !" || data[3] === "ah !" || data[3] === "ah!" || data[3] === "Ah!" || data[3] === "AH!" || data[3] === "AH !") {
                audio.play();
            }

            next(data);
        };
    });
})();
