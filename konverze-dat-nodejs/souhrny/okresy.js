var fs = require('fs');

var list = [];

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

function processSnemovna (results, o) {  results.forEach(election => {
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

function processTowns(okres, o) {
  okres.list.forEach(town => {

    if (town.list) return;

    try {
      var content = fs.readFileSync('../data/souhrny/obce/' + o.nuts + '/' + town.num + '.json');
      var json = JSON.parse(content);

      processPrezident(json.volby.prezident, o.volby.prezident);
      processSnemovna(json.volby.snemovna, o.volby.snemovna);
      processSnemovna(json.volby.kraje, o.volby.kraje);
      processSnemovna(json.volby.eu, o.volby.eu);
    } catch (e) {
      console.log(town.nuts, e);
    }
  });
}

function processFile(okres, kraj) {
  var o = {
    num: okres.num,
    name: okres.name,
    nuts: okres.nuts,
    kraj: {
      num: kraj.num,
      name: kraj.name
    },
    volby: {
      prezident: [],
      snemovna: [],
      kraje: [],
      eu: []
    }
  }

  processTowns(okres, o);

  writeJSON(o, '../data/souhrny/okresy/' + o.num + '.json');
}

Promise.all([hierarchyFile]).then(values => {
  values[0].hierarchy.list.forEach(reg => {
    reg.list.forEach(kraj => {
      kraj.list.forEach(okres => {
        processFile(okres, kraj);
      });
    });
  });
});
