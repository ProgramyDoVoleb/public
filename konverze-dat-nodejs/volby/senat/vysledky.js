var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var dates = [
  {date: 20081017, type: 0},
  {date: 20101015, type: 0},
  {date: 20110318, type: 1},
  {date: 20121012, type: 0},
  {date: 20140110, type: 1},
  {date: 20140919, type: 1},
  {date: 20141010, type: 0},
  {date: 20161007, type: 0},
  {date: 20170127, type: 1},
  {date: 20180105, type: 1},
  {date: 20180518, type: 1},
  {date: 20181005, type: 0},
  {date: 20190405, type: 1}
];

function writeResults (json, file) {

  var dir = "../data/volby/senat/" + file;

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }

  fs.writeFile(dir + '/vysledky.json', JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }
  });
}

function informAboutWinner (winner, area, date, regular) {
  var obvod = so.list.find(a => a.id === area);

  obvod.votes.push({
    date,
    regular,
    winner
  });

  fs.writeFile('../data/obecne/senatni-obvody.json', JSON.stringify(so), function(err) {

      if(err) {
          return console.log(err);
      }
  });
}

function processFile (result, candidates, vote) {

  var json = {
    created: new Date().getTime(),
    date: vote.date,
    regular: vote.type === 0,
    areas: []
  }

  result.VYSLEDKY.OBVOD.forEach(area => {
    var data = processArea(area, candidates, Number(area.$.CISLO), vote);

    data.id = Number(area.$.CISLO);
    data.name = area.$.NAZEV;

    informAboutWinner(data.winner, data.id, json.date, json.regular);

    json.areas.push(data);
  })

  writeResults(json, vote.date);
}

function processArea (result, candidates, areaCode, vote) {

  var json = {
    round1: {
      votes: Number(result.UCAST[0].$.PLATNE_HLASY),
      voters: Number(result.UCAST[0].$.ZAPSANI_VOLICI),
      attended: Number(result.UCAST[0].$.VYDANE_OBALKY),
      candidates: []
    },
    winner: []
  };

  if (result.UCAST.length === 2) {
    json.round2 = {
      votes: Number(result.UCAST[1].$.PLATNE_HLASY),
      voters: Number(result.UCAST[1].$.ZAPSANI_VOLICI),
      attended: Number(result.UCAST[1].$.VYDANE_OBALKY),
      candidates: []
    }
  }

  result.KANDIDAT.forEach(person => {

    var winner = false;

    var r1 = {
      id: Number(person.$.PORADOVE_CISLO),
      name: [person.$.TITULPRED, person.$.JMENO, person.$.PRIJMENI, person.$.TITULZA],
      votes: Number(person.$.HLASY_1KOLO),
      pct: Number(person.$.HLASY_PROC_1KOLO),
      progress: person.$.ZVOLEN_1KOLO != "NEZVOLEN"
    };

    json.round1.candidates.push(r1);

    if (result.UCAST.length === 2 && r1.progress === true) {

      var r2 = {
        id: Number(person.$.PORADOVE_CISLO),
        name: [person.$.TITULPRED, person.$.JMENO, person.$.PRIJMENI, person.$.TITULZA],
        votes: Number(person.$.HLASY_2KOLO),
        pct: Number(person.$.HLASY_PROC_2KOLO),
        progress: person.$.ZVOLEN_2KOLO != "NEZVOLEN"
      }

      json.round2.candidates.push(r2);

      if (r2.progress === true) winner = true;

    } else {
      // no second round

      if (r1.progress === true) winner = true;
    }

    if (winner === true) {

      var r3 = candidates.list.find(cand => cand.id === Number(person.$.PORADOVE_CISLO) && cand.reg === areaCode);

      r3.stats = {
        round1: {
          votes: r1.votes,
          pct: r1.pct
        }
      }

      if (result.UCAST.length === 2) {
        r3.stats.round2 = {
          votes: r2.votes,
          pct: r2.pct
        }
      }

      json.winner = r3;
    }
  });

  return json;
}

var so = {};

new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/senatni-obvody.json', function(err, data) {

    so = JSON.parse(data);

    so.list.forEach(area => area.votes = []);

    resolve();
  })
}).then(() => {
  dates.forEach(vote => {

    var results = new Promise (function (resolve, reject) {
      fs.readFile('../zdroje/volby/senat/' + vote.date + '/vysledky.xml', function(err, data) {
        parser.parseString(data, function (err, json) {
          resolve(json);
        });
      })
    });

    var candidates = new Promise (function (resolve, reject) {
      fs.readFile('../data/volby/senat/' + vote.date + '/kandidati.json', function(err, data) {
        resolve(JSON.parse(data));
      })
    })

    try {
      Promise.all([results, candidates]).then(result => {
        processFile(result[0], result[1], vote);
      });
    } catch (e) {
      console.log(e);
    }
  });
})
