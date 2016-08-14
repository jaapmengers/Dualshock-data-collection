'use strict';
// Module dependencies.
var dsutilities = require('./utilities'),
    Smoothing = require('./smoothing'),
    config = require('./config');

function transform(value) {
  return Math.abs(value - 128);
}

//Proccess Analog stick events.
var Analogs = function(controller) {

    var varianceThreshhold = 1,
        outputSmoothing = new Smoothing(smoothInput),
        analogSticks = config.getControllerConfig().analogSticks,
        smoothInput = config.getOptions().analogStickSmoothing;

    //Private methods
    var processStick = function(analogStick, data) {
      return [transform(data[analogStick.x]), transform(data[analogStick.y])];
        // var currentValue = {
        //         x: data[analogStick.x],
        //         y: data[analogStick.y]
        //     },
        //     previousValue = {
        //         x: outputSmoothing.readLastPosition(analogStick.name + 'x'),
        //         y: outputSmoothing.readLastPosition(analogStick.name + 'y')
        //     };
        //
        // //we only raise an event if both
        // if (dsutilities.isWithinVariance(previousValue.x, currentValue.x, varianceThreshhold) ||
        //     dsutilities.isWithinVariance(previousValue.y, currentValue.y, varianceThreshhold)) {
        //
        //     currentValue.x = outputSmoothing.smooth(analogStick.name + 'x', currentValue.x);
        //     currentValue.y = outputSmoothing.smooth(analogStick.name + 'y', currentValue.y);
        //
        //     // Update and emit
        //     if (controller[analogStick.name]) {
        //         controller[analogStick.name].x = currentValue.x;
        //         controller[analogStick.name].y = currentValue.y;
        //     }
        //     controller.emit(analogStick.name + ':move', currentValue);
        // }
    };

    // Public methods
    //process all the analog events.
    this.process = function(hid, data) {
      return analogSticks.map((x) => processStick(x, data)).reduce((acc, cur) => acc.concat(cur), []);
    };
};

module.exports = Analogs;
