// ==UserScript==
// @name         [Leek Wars] Ah !
// @namespace    https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @version      0.2.1
// @description  Déclenche un "Ah !" sonore lors d'un "Ah !" dans le chat
// @author       TheTintin
// @projectPage   https://github.com/PerthuisQuentin/Leek-Wars-Scripts/
// @downloadURL   https://github.com/PerthuisQuentin/Leek-Wars-Scripts/raw/master/Ah/ah.js
// @updateURL     https://github.com/PerthuisQuentin/Leek-Wars-Scripts/raw/master/Ah/ah.js
// @match         *://*.leekwars.com/*
// ==/UserScript==

(function() {
    'use strict';

    var audio = new Audio('https://raw.githubusercontent.com/PerthuisQuentin/Leek-Wars-Scripts/master/Ah/ah.wav');
    var regex = new RegExp(/ah\s?!/i);

    function check(message) {
        if(!regex.test(message)) return;

        audio.play();
    }

    LW.on('pageload', function() {
        var chatReceive = LW.chat.receive;
        var messageReceive = LW.messages.receive;

        LW.chat.receive = function(data) {
            check(data[3]);
            chatReceive(data);
        };

        LW.messages.receive = function(data) {
            check(data.message);
            messageReceive(data);
        };
    });
})();