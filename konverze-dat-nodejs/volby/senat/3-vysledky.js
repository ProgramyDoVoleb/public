var fs = require('fs');
const $ = require('cheerio');

var list2 = [19961116, 19981114, 19990828, 20001112, 20021025, 20031107, 20031031, 20041105, 20041008, 20061020, 20070413, 20070427, 20081017, 20101015, 20110318, 20121012, 20140110, 20140919, 20141010, 20161007, 20170127, 20180105, 20180518, 20181005, 20190405, 20200605];

var list = [20200605];

const sourceDIR = '../zdroje/volby/senat/';
const targetDIR = '../data/volby/senat/';

var elections = JSON.parse(fs.readFileSync('../data/obecne/seznam-voleb.json')).list.find(x => x.hash === 'senatni-volby').list;
var areaList = JSON.parse(fs.readFileSync('../data/obecne/senatni-volby.json')).list;

console.log(elections.length, areaList.length);

// process election

list.forEach((dir, i) => {
  setTimeout(() => {
    var candidates = JSON.parse(fs.readFileSync(targetDIR + dir + '/kandidati.json'));
    var areas = fs.readdirSync(sourceDIR + dir + '/obvod/');

    var obj = {
      created: new Date().getTime(),
      date: dir,
      regular: elections.find(e => e.id === dir).type === "regular",
      areas: []
    }

    areas.forEach(area => {
      var id = Number(area.split('.html')[0]);
      var html = fs.readFileSync(sourceDIR + dir + '/obvod/' + area).toString();

      var data = {
        id,
        name: areaList.find(a => a.id === id).name,
        winner: {}
      }

      var tables = $('table', html);

      // stats

      var rnds = $('tr', tables[0]);
      var rndIndex = 0;

      Object.keys(rnds).forEach(rnd => {
        var td = $('td', rnds[rnd]);

        if (td.length && td.length > 0) {
          rndIndex++;

          if (rndIndex < 3) {
            data['round' + rndIndex] = {};
            data['round' + rndIndex].voters = Number(td[3].children[0].data.split(' ').join(''));
            data['round' + rndIndex].votes = Number(td[7].children[0].data.split(' ').join(''));
            data['round' + rndIndex].attended = Number(td[4].children[0].data.split(' ').join(''));
            data['round' + rndIndex].pct = Number(td[5].children[0].data.split(',').join('.'));
            data['round' + rndIndex].candidates = [];
          }
        }
      });

      // results

      var results = $('tr', tables[1]);
      var passed = false;

      Object.keys(results).forEach((result, index) => {
        var td = $('td', results[result]);

        if (td.length && td.length > 0) {
          var candID = td[0].children[0].data.split('+');
              candID = candID[candID.length - 1].split('*');
              candID = Number(candID[candID.length - 1]);

          var winner = td[0].children[0].data.split('*').length > 1;
          var second = td[0].children[0].data.split('+').length > 1;

          var person = candidates.list.find(p => p.reg === id && (p.no ? p.no : p.id) === candID);

          if (person && ((index > 2 && candID != 1) || (index === 2 && candID === 1))) {
            if (winner) {
              data.winner = person;
              data.winner.stats = {
                round1: {
                  votes: Number(td[5].children[0].data.split(' ').join('')),
                  pct: Number(td[7].children[0].data.split(',').join('.'))
                }
              }

              if (rndIndex > 2) {
                data.winner.stats.round2 = {
                  votes: Number(td[6].children[0].data.split(' ').join('')),
                  pct: Number(td[8].children[0].data.split(',').join('.'))
                }
              }
            }

            if (rndIndex > 2 && (winner || second)) {
              data.round2.candidates.push({
                id: candID,
                name: person.name,
                votes: Number(td[6].children[0].data.split(' ').join('')),
                pct: Number(td[8].children[0].data.split(',').join('.')),
                progress: winner
              });
            }

            data.round1.candidates.push({
              id: candID,
              name: person.name,
              votes: Number(td[5].children[0].data.split(' ').join('')),
              pct: Number(td[7].children[0].data.split(',').join('.')),
              progress: winner || second
            });

            passed = true;
          }

        }
      });

      // end

      obj.areas.push(data);
    });

    fs.writeFile(targetDIR + dir + '/vysledky.json', JSON.stringify(obj, null, 2), () => {});

    console.log(dir, 'done');
  }, 100 * i);
});
