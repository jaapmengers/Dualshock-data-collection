const dualShock = require('./lib/dualshock.js');
const Rx = require('rx');
const fs = require('fs');
require('sylvester');
const readline = require('readline');
const keypress = require('keypress');

let streams = [];

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

function getPlayerNames() {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Who\'s playing? ', (answer) => {
      console.log('Answer', answer);

      rl.close();

      const players = answer.split(',');

      resolve(players);
    });
  });
}


function registerPlayer(playerName) {
  return new Promise(resolve => {
    console.log(`${playerName}, press R2`);

    function callback(hid) {
      controller.removeListener('r2:release', callback);
      console.log('Calling resolve');
      resolve({ name: playerName, hid: hid });
    }

    const listener = controller.on('r2:release', callback);
  });
}

function registerPlayers(playerNames) {
  return new Promise((resolve, reject) => {
    const iets = playerNames.reduce((acc, player) => {
      return acc
        .then(x => {
          return registerPlayer(player).then(y => x.concat([y]))
        });
    }, Promise.resolve([])).then(players => {
      resolve(players);
    })
  });
}

getPlayerNames()
  .then(registerPlayers)
  .then(saveEvents);

function toString(x) {
  return x.join(',') + '\n';
}

function saveEvents(players) {
  keypress(process.stdin);

  let pause = false;

  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.name == 'p') {
      pause = !pause;
      if(pause) {
        console.log('Paused');
      } else {
        console.log('Resumed');
      }
    } else if (key && key.ctrl && key.name == 'c') {
      stop();
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

  console.log('Ready to start');

  streams = players.map(player => {
    const stream = fs.createWriteStream(`${player.name}.txt`);

    const events = Rx.Observable.fromEvent(controller, `${player.hid}:rawData`);
    events.subscribe(x => {
      if(!stream.closed && !pause) {
        stream.write(toString(x));
      }
    });

    return stream;
  });
}

function stop() {
  streams.forEach(x => {
    x.end();
  });

  process.exit();
}


global.count = 0;
//
// events.bufferWithCount(250).map(x => {
//   return x.reduce((acc, cur) => {
//     if(acc.length === 0) {
//       return $V(cur);
//     } else {
//       const res = acc.add($V(cur));
//       return res;
//     }
//   }, []);
// }).map(x => x.elements).subscribe(x => {
//   if(!wstreamReduced.closed) {
//     wstreamReduced.write(toString(x.concat([1])));
//   }
// });
