var fs = require('fs');

var kraje = [
  { id: 0, num: 1100},
  { id: 1, num: 2100},
  { id: 2, num: 3100},
  { id: 3, num: 3200},
  { id: 4, num: 4100},
  { id: 5, num: 4200},
  { id: 6, num: 5100},
  { id: 7, num: 5200},
  { id: 8, num: 5300},
  { id: 9, num: 6100},
  { id: 10, num: 6200},
  { id: 11, num: 7100},
  { id: 12, num: 7200},
  { id: 13, num: 8100}
];

function writeJSON (json, file) {
  fs.writeFile(file, JSON.stringify(json), function(err) {
      if(err) {
          return console.log(err);
      }
  });
}

var hierarchyFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/obce-struktura.json', function(err, content) {
    resolve(JSON.parse(content));
  });
});

function getYearResultFile (year) {
  return new Promise (function (resolve, reject) {
    fs.readFile('../data/volby/kv/' + year + '/vysledky.json', function(err, content) {
      resolve(JSON.parse(content));
    });
  });
}

function processPrezident (results, o) {
  results.forEach(election => {
    var el = o.find(e => e.year === election.year);

    if (!el) {
      el = {
        year: election.year,
        round1: {
          voters: 0,
          votes: 0,
          candidates: []
        },
        round2: {
          voters: 0,
          votes: 0,
          candidates: []
        }
      };

      o.push(el);
    }

    el.round1.voters += election.round1.voters;
    el.round1.votes += election.round1.votes;

    el.round2.voters += election.round2.voters;
    el.round2.votes += election.round2.votes;

    election.round1.candidates.forEach(cand => {
      var c = el.round1.candidates.find (e => e.id === cand.id);

      if (!c) {
        c = {
          id: cand.id,
          name: cand.name,
          votes: 0
        }

        el.round1.candidates.push(c);
      }

      c.votes += cand.votes;
    });

    election.round2.candidates.forEach(cand => {
      var c = el.round2.candidates.find (e => e.id === cand.id);

      if (!c) {
        c = {
          id: cand.id,
          name: cand.name,
          votes: 0
        }

        el.round2.candidates.push(c);
      }

      c.votes += cand.votes;
    });
  });
}

function processGeneric (results, o) {  results.forEach(election => {
    var el = o.find(e => e.year === election.year);

    if (!el) {
      el = {
        year: election.year,
        stats: {
          voters: 0
        },
        result: []
      };

      o.push(el);
    }

    el.stats.voters += election.stats.voters;

    election.result.forEach(cand => {
      var c = el.result.find (e => e.id === cand.id);

      if (!c) {
        c = {
          id: cand.id,
          reg: cand.reg,
          name: cand.name,
          votes: 0
        }

        el.result.push(c);
      }

      c.votes += cand.votes;
    });
  });
}

function processKrajResults (kraj, o, year, results) {
  var obj = {
    year: year,
    stats: {
      voters: results.voters,
      votes: results.votes
    },
    parties: results.parties
  }

  o.push(obj);
}

function processKraj(kraj, o, results) {
  kraj.list.forEach(okres => {

    try {
      var content = fs.readFileSync('../data/souhrny/okresy/' + okres.num + '.json');
      var json = JSON.parse(content);

      processPrezident(json.volby.prezident, o.volby.prezident);
      processGeneric(json.volby.snemovna, o.volby.snemovna);
      processGeneric(json.volby.eu, o.volby.eu);
    } catch (e) {
      console.log(okres.nuts, e);
    }

  });

  results.forEach(result => {
    var kr = kraje.find(x => x.num === o.num);

    if (kr.id != 0) processKrajResults (kraj, o.volby.kraje, result.year, result.results.find(k => k.id === kr.id));
  });
}

function processFile(kraj, results) {
  var o = {
    num: kraj.num,
    name: kraj.name,
    nuts: kraj.nuts,
    volby: {
      prezident: [],
      snemovna: [],
      kraje: [],
      eu: []
    }
  }

  processKraj(kraj, o, results);

  writeJSON(o, '../data/souhrny/kraje/' + o.num + '.json');
}

Promise.all([hierarchyFile, getYearResultFile(2008), getYearResultFile(2012), getYearResultFile(2016)]).then(values => {

  var results = [
    {year: 2008, results: values[1]},
    {year: 2012, results: values[2]},
    {year: 2016, results: values[3]}
  ]

  values[0].hierarchy.list.forEach(reg => {
    reg.list.forEach(kraj => {
      processFile(kraj, results);
    });
  });
});
