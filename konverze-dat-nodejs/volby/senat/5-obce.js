var fs = require('fs');
const $ = require('cheerio');

var list2 = [19961116, 19981114, 19990828, 20001112, 20021025, 20031107, 20031031, 20041105, 20041008, 20061020, 20070413, 20070427, 20081017, 20101015, 20110318, 20121012, 20140110, 20140919, 20141010, 20161007, 20170127, 20180105, 20180518, 20181005, 20190405];

var list = [20200605];

const sourceDIR = '../zdroje/volby/senat/';
const targetDIR = '../data/volby/senat/';

var elections = JSON.parse(fs.readFileSync('../data/obecne/seznam-voleb.json')).list.find(x => x.hash === 'senatni-volby').list;
var townsListFile = JSON.parse(fs.readFileSync('../data/obecne/obce-flat.json'));
var townsList = [];

Object.keys(townsListFile.list).forEach(region => {
  townsListFile.list[region].forEach(town => {
    townsList.push([
      town[0],
      region
    ]);
  });
});

// process election

list.forEach((dir, i) => {
  setTimeout(() => {
    var candidates = JSON.parse(fs.readFileSync(targetDIR + dir + '/kandidati.json'));
    var towns = fs.readdirSync(sourceDIR + dir + '/obce');

    console.log(dir, towns.length);

    towns.forEach((town, index2) => {
      setTimeout(() => {

        if (town.split('.html').length != 2) return;

        var id = Number(town.split('.html')[0].split('-')[0]);
        var num = Number(town.split('.html')[0].split('-')[1]);

        // console.log(dir, id, num, 'check');

        var townLocation = townsList.find(t => t[0] === num);

        if (!townLocation) return;

        var link = '../data/souhrny/obce/' + townLocation[1] + '/' + num + '.json';

        if (!fs.existsSync(link)) {
          console.log("not found", link);
          return;
        }

        var townData = JSON.parse(fs.readFileSync(link));
        var html = fs.readFileSync(sourceDIR + dir + '/obce/' + town).toString();

        // console.log(dir, id, num, 'start', !!townData);

        if (townData) {
          var data = townData.volby.senat.find(d => d.date === dir);

          if (!data) {
            data = {
              date: dir
            }

            townData.volby.senat.push(data);

          }

          data.area = id;
          data.regular = elections.find(e => e.id === dir).type === "regular";
          data.winner = undefined;

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

              var person = candidates.list.find(p => p.reg === id && p.id === candID);

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
                    pct: Number(td[8].children[0].data.split(',').join('.'))
                  });
                }

                data.round1.candidates.push({
                  id: candID,
                  name: person.name,
                  votes: Number(td[5].children[0].data.split(' ').join('')),
                  pct: Number(td[7].children[0].data.split(',').join('.'))
                });

                passed = true;
              }

            }
          });

          fs.writeFile(link, JSON.stringify(townData), () => {});

          // console.log(dir, id, num, 'done');

        } else {

          console.log(dir, id, num, 'skipped');

        }

      }, 10 * index2);
    });
  }, 90000 * i);
});
