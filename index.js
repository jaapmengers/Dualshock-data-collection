const dualShock = require('./lib/dualshock.js');
const Rx = require('rx');
require('sylvester');


var controller = dualShock(
{
    //you can use a ds4 by uncommenting this line.
    config: "dualshock4-generic-driver",
    //if using ds4 comment this line.
    // config : "dualShock3",
    //smooths the output from the acelerometers (moving averages) defaults to true
    accelerometerSmoothing : false,
    //smooths the output from the analog sticks (moving averages) defaults to false
    analogStickSmoothing : false
});


const events = Rx.Observable.fromEvent(controller, 'rawData');

global.count = 0;

events.bufferWithCount(250).map(x => {
  return x.reduce((acc, cur) => {
    if(acc.length === 0) {
      return $V(cur);
    } else {
      const res = acc.add($V(cur));
      return res;
    }
  }, []);
}).subscribe(x => console.log('done', x));

// .reduce((acc, cur) => {
//
//   global.count += 1;
//
//   console.log(global.count);
//
//   if(acc.length === 0) {
//     return $V(cur);
//   } else {
//     const res = acc.add($V(cur));
//     return res;
//   }
// }, []).subscribe((x) => console.log('Done'));

// controller.onAny(function(event, value){
//     console.log(event, value);
// });
