var fs = require('fs');
const $ = require('cheerio');

var list = [19961116, 19981114, 19990828, 20001112, 20021025, 20031031, 20031107, 20041008, 20041105, 20061020, 20070413, 20070427, 20081017, 20101015, 20110318, 20121012, 20140110, 20140919, 20141010, 20161007, 20170127, 20180105, 20180518, 20181005, 20190405];

const targetDIR = '../data/volby/senat/';

var elections = JSON.parse(fs.readFileSync('../data/obecne/seznam-voleb.json')).list.find(x => x.hash === 'senatni-volby').list;
var genesis = {
  created: new Date().getTime(),
  timeline: [],
  senate: []
}

var senate = [];

for (var i = 0; i < 81; i++) {
  senate.push({
    area: i + 1,
    elected: undefined
  })
}

list.forEach((date, dateIndex) => {
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

      senate[area.id - 1].elected = area.winner;

    });

    fs.writeFileSync(targetDIR + date + '/senate.json', JSON.stringify(senate));

    var parties = [];

    senate.forEach(senator => {

      var member = parties.find(p => p.reg === senator.elected.member);

      if (!member) {
        parties.push({reg: senator.elected.member, members: 0, nominees: 0});
        member = parties.find(p => p.reg === senator.elected.member);
      }

      var nominee = parties.find(p => p.reg === senator.elected.nominee);

      if (!nominee) {
        parties.push({reg: senator.elected.nominee, members: 0, nominees: 0});
        nominee = parties.find(p => p.reg === senator.elected.nominee);
      }

      member.members++;
      nominee.nominees++;
    });

    if (dateIndex > 0) {
      parties.forEach(party => {
        var partyPrevious = genesis.senate[dateIndex - 1].parties.find(p => p.reg === party.reg);

        if (partyPrevious) {
          party.diff = {
            members: party.members - partyPrevious.members,
            nominees: party.nominees - partyPrevious.nominees
          }
        } else {
          party.diff = {
            members: party.members,
            nominees: party.nominees
          }
        }
      });
    }

    genesis.senate.push({date, parties});

    genesis.timeline.push(obj);
  }
});

fs.writeFile(targetDIR + 'genesis.json', JSON.stringify(genesis), () => {});
