'use strict';
// Module dependencies.
var config = require('./config'),
    dsutilities = require('./utilities');

//Proccess button events.
var Buttons = function(controller) {

    var buttons = config.getControllerConfig().buttons;

    // convert strings to numbers, e.g. "0x01" to 0x01
    // must be converted because JSON doesn't allow numbers with leading zeros
    buttons.forEach(function(button) {
        if (typeof button.buttonValue == "string") {
            button.buttonValue = parseInt(button.buttonValue);
        }

        if (typeof button.mask == "string") {
            button.mask = parseInt(button.mask);
        } else if (!(button.mask instanceof Number)) {
            button.mask = 0xFF;
        }

        //generate event name aliases:
        button.eventPrefixes = dsutilities.generateEventPrefixAliases(button.name);
    });


    var buffer = {};

    //Private methods
    var emitEvent = function(button, eventText, data) {
        button.eventPrefixes.forEach(function(eventPrefix) {
            controller.emit(eventPrefix + eventText, data);
        });
    };
    var processButton = function(button, hid, data) {
        //make sure the data contains a value for the specified block
        //and bitwise operation for the button value

        var block = data[button.buttonBlock] & button.mask;
        var hit = (block & button.buttonValue) == button.buttonValue;
        var value = 0;
        var state = 0; // 0: up, 1: down, 2: hold

        // console.log('Block', block, 'hit', hit);

        // special case for the dualshock 4's dpadUp button as it causes the
        // lower 8 bits of it's block to be zeroed
        if (!button.buttonValue) {
            hit = !block;
        }

        // special case for dualshock 4's dpad - they are not bitmasked values as
        // they cannot be pressed together - ie. up, left and upleft are three
        // different values - upleft is not equal to up & left
        if (button.buttonBlock == 5 && block < 0x08) {
            hit = block == button.buttonValue;
        }

        const buttonName = `${hid}_${button.name}`;

        if (hit) {
            value = 1;

            //if the button is in the released state.
            if (!buffer[buttonName]) {
                state = 1;
                buffer[buttonName] = true;
                emitEvent(button, ':press', button.name);
            } else {
                state = 2;
                emitEvent(button, ':hold', button.name);
            }

            //send the analog data
            if (button.analogPin && data[button.analogPin]) {
                emitEvent(button, ':analog', data[button.analogPin]);
            }

        } else if (buffer[buttonName]) {
            //button was pressed and is not released
            buffer[buttonName] = false;

            //button is no longer pressed, emit a analog 0 event.
            if (button.analogPin) {
                emitEvent(button, ':analog', 0);
            }
            //emit the released event.

            emitEvent(button, ':release', hid);
        }

        if (controller[buttonName]) {
            controller[buttonName].value = value;
            controller[buttonName].state = state;
        }

        return hit ? 1 : 0;
    };

    // Public methods
    //process all the analog events.
    this.process = function(hid, data) {
        const res = buttons.map(x => processButton(x, hid, data) * 128 );
        return res;

        // for (var i = 0; i < buttons.length; i++) {
        //     processButton(buttons[i], data);
        // }
    };
};

module.exports = Buttons;
