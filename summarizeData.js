const Rx = require('rx');
const fs = require('fs');
require('sylvester');
require('./utils');

const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('jaap2.txt')
});

lineReader.on('close', function(){
  wstreamReduced.close();
  console.log('Klaar');
});

const events = Rx.Observable.fromEvent(lineReader, 'line');

function toString(x) {
  return x.join(',') + '\n';
}

function getButtonSummary(events) {
  const grouped = events.groupByUntilChanged().filter(x => x[0] === 1);

  return {
    amount: grouped.length,
    average: grouped.map(x => x.length).average()
  }
}

const wstreamReduced = fs.createWriteStream(`jaap_test.txt`);
events.map(x => x.split(',').map(y => parseInt(y)))
  .bufferWithCount(1000)
  .map(event => {
    const l2Summary = getButtonSummary(event.map(y => y[4] / 128));
    const r2Summary = getButtonSummary(event.map(y => y[5] / 128));
    const circleSummary = getButtonSummary(event.map(y => y[6] / 128));
    const xSummary = getButtonSummary(event.map(y => y[7] / 128));

    return [l2Summary.amount, l2Summary.average, r2Summary.amount, r2Summary.average, xSummary.amount, xSummary.average, circleSummary.amount, circleSummary.average];
  }).subscribe(x => {
    if(!wstreamReduced.closed) {
      wstreamReduced.write(toString(x));
    }
  });
