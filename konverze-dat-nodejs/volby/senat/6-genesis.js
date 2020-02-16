var fs = require('fs');
const $ = require('cheerio');

var list = [19961116, 19981114, 19990828, 20001112, 20021025, 20031031, 20031107, 20041008, 20041105, 20061020, 20070413, 20070427, 20081017, 20101015, 20110318, 20121012, 20140110, 20140919, 20141010, 20161007, 20170127, 20180105, 20180518, 20181005, 20190405];

const targetDIR = '../data/volby/senat/';

var elections = JSON.parse(fs.readFileSync('../data/obecne/seznam-voleb.json')).list.find(x => x.hash === 'senatni-volby').list;
var genesis = {
  created: new Date().getTime(),
  timeline: []
}

list.forEach(date => {
  var el = elections.find(e => e.id === date);
  var result = JSON.parse(fs.readFileSync(targetDIR + date + '/vysledky.json'));

  if (el && result) {
    var obj = {
      date,
      reason: el.reason || 'řádné volby',
      elected: []
    }

    result.areas.forEach(area => {
      var item = {
        area: area.id,
        winner: area.winner,
        stats: {}
      }

      if (area.round1) item.stats.round1 = {pct: area.round1.pct};
      if (area.round2) item.stats.round2 = {pct: area.round2.pct};

      obj.elected.push(item);

    });

    genesis.timeline.push(obj);
  }
});

fs.writeFile(targetDIR + 'genesis.json', JSON.stringify(genesis), () => {});
