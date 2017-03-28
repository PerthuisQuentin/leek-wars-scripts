// ==UserScript==
// @name         [Leek Wars] Ah !
// @namespace    https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @version      0.1
// @description  Déclenche un "Ah !" sonore lors d'un "Ah !" dans le chat
// @author       TheTintin
// @projectPage   https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @downloadURL   https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @updateURL     https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @match         *://*.leekwars.com/*
// ==/UserScript==

(function() {
    'use strict';

    LW.on('pageload', function() {
        var next = LW.chat.receive;

        LW.chat.receive = function(data) {
            if(data[3] === "Ah !") {
                console.log("Ah !");
            }

            next(data);
        };
    });
})();
