const Rx = require('rx');
const fs = require('fs');
require('sylvester');

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('joel_tagged.txt')
});

lineReader.on('close', function(){
  wstreamReduced.close();
  console.log('Klaar');
});

const events = Rx.Observable.fromEvent(lineReader, 'line');

function toString(x) {
  return x.join(',') + '\n';
}

const wstreamReduced = fs.createWriteStream(`joel_reduced.txt`);

events.map(x => x.split(',').map(y => parseInt(y)))
  .bufferWithCount(250)
  .map(x => {
  return x.reduce((acc, cur) => {
    if(acc.length === 0) {
      return $V(cur);
    } else {
      const res = acc.add($V(cur));
      return res;
    }
  }, []);
}).map(x => x.elements).subscribe(x => {
  if(!wstreamReduced.closed) {
      wstreamReduced.write(toString(x));
    }
});
