var fs = require('fs');

var list = [];

function writeJSON (json, file) {
  fs.writeFile(file, JSON.stringify(json), function(err) {
      if(err) {
          return console.log(err);
      }
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
          attended: 0,
          candidates: []
        },
        round2: {
          voters: 0,
          votes: 0,
          attended: 0,
          candidates: []
        }
      };

      o.push(el);
    }

    el.round1.voters += election.round1.voters;
    el.round1.votes += election.round1.votes;
    el.round1.attended += election.round1.attended;

    el.round2.voters += election.round2.voters;
    el.round2.votes += election.round2.votes;
    el.round2.attended += election.round2.attended;

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

    election.round1.candidates.forEach(cand => {
      var c = el.round1.candidates.find (e => e.id === cand.id);

      c.pct = Math.round(c.votes / el.round1.votes * 10000) / 100;
    });

    election.round2.candidates.forEach(cand => {
      var c = el.round2.candidates.find (e => e.id === cand.id);

      c.pct = Math.round(c.votes / el.round2.votes * 10000) / 100;
    });
  });
}

function processSnemovna (results, o) {
  results.forEach(election => {
    var el = o.find(e => e.year === election.year);

    if (!el) {
      el = {
        year: election.year,
        stats: {
          voters: 0,
          votes: 0,
          attended: 0,
          pct: 0
        },
        result: []
      };

      o.push(el);
    }

    el.stats.voters += election.stats.voters;
    el.stats.attended += Math.round(election.stats.voters * election.stats.pct / 100);

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
      el.stats.votes += cand.votes;
      el.stats.pct = Math.round(el.stats.attended / el.stats.voters * 10000) / 100;
    });

    election.result.forEach(cand => {
      var c = el.result.find (e => e.id === cand.id);

      c.pct = Math.round(c.votes / el.stats.votes * 10000) / 100;
    });
  });
}

function processTowns(o, okres, mesto) {

  values.list[okres].filter(t => t[7] && t[7] === mesto).forEach(town => {
    try {
      var content = fs.readFileSync('../data/souhrny/obce/' + okres + '/' + town[0] + '.json');
      var json = JSON.parse(content);

      processPrezident(json.volby.prezident, o.prezident);
      processSnemovna(json.volby.snemovna, o.snemovna);
      processSnemovna(json.volby.kraje, o.kraje);
      processSnemovna(json.volby.eu, o.eu);
    } catch (e) {
      console.log(town[0], e);
    }
  });
}

function processFile(okres, mesto) {
  var o = {
    prezident: [],
    snemovna: [],
    kraje: [],
    eu: []
  }

  processTowns(o, okres, mesto);

  var file = '../data/souhrny/obce/' + okres + '/' + mesto + '.json';

  var content = JSON.parse(fs.readFileSync(file));

  content.volby.prezident = o.prezident;
  content.volby.snemovna = o.snemovna;
  content.volby.kraje = o.kraje;
  content.volby.eu = o.eu;

  writeJSON(content, file);
}

var values = JSON.parse(fs.readFileSync('../data/obecne/obce-flat.json'));

values.vycleneno.forEach(num => {

  Object.keys(values.list).forEach(district => {
    var town = values.list[district].find(t => t[0] === num);

    if (town) {
      processFile(district, num);
    }
  });
});
