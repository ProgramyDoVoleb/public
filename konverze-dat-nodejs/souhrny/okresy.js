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
  fs.readFile('../data/obecne/obce-flat.json', function(err, content) {
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
          attended: 0
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

      c.votes += cand.votes || 0;
      el.stats.votes += cand.votes || 0;
    });

    election.result.forEach(cand => {
      var c = el.result.find (e => e.id === cand.id);

      c.pct = Math.round(c.votes / el.stats.votes * 10000) / 100;
    });
  });
}

function processTowns(okres, o, except) {

  okres.forEach(town => {

    if (town.list) return;

    try {
      var content = fs.readFileSync('../data/souhrny/obce/' + o.nuts + '/' + town[0] + '.json');
      var json = JSON.parse(content);

      if (except.indexOf(town[0]) === -1) processPrezident(json.volby.prezident, o.volby.prezident);
      if (except.indexOf(town[0]) === -1) processSnemovna(json.volby.snemovna, o.volby.snemovna);
      if (except.indexOf(town[0]) === -1) processSnemovna(json.volby.kraje, o.volby.kraje);
      if (except.indexOf(town[0]) === -1) processSnemovna(json.volby.eu, o.volby.eu);
    } catch (e) {
      console.log(town[0], e);
    }
  });
}

function processFile(list, okres, kraj, except) {
  var o = {
    nuts: okres,
    kraj: {
      nuts: kraj.nuts
    },
    volby: {
      prezident: [],
      snemovna: [],
      kraje: [],
      eu: []
    }
  }

  processTowns(list, o, except);

  writeJSON(o, '../data/souhrny/okresy/' + o.nuts + '.json');
  writeJSON({nuts: o.nuts, volby: {prezident: o.volby.prezident}}, '../data/souhrny/okresy/prezident/' + o.nuts + '.json');
  writeJSON({nuts: o.nuts, volby: {snemovna: o.volby.snemovna}}, '../data/souhrny/okresy/snemovna/' + o.nuts + '.json');
  writeJSON({nuts: o.nuts, volby: {kraje: o.volby.kraje}}, '../data/souhrny/okresy/kraje/' + o.nuts + '.json');
  writeJSON({nuts: o.nuts, volby: {eu: o.volby.eu}}, '../data/souhrny/okresy/eu/' + o.nuts + '.json');

  all.push(o);
}

var all = [];

Promise.all([hierarchyFile]).then(values => {

  Object.keys(values[0].list).forEach(key => {
    processFile(values[0].list[key], key, {nuts: key.substring(0, 5)}, values[0].vycleneno);
  });

  Object.keys(all[5].volby).forEach(type => {
    all[5].volby[type].forEach(el => {

      var o = {
        type,
        el: el.date || el.year,
        list: []
      }

      all.forEach(kraj => {
        o.list.push({
          nuts: kraj.nuts,
          results: kraj.volby[type].find(e => (e.date || e.year) === o.el)
        })
      });

      writeJSON(o, '../data/souhrny/okresy/' + type + '/' + o.el + '/souhrn.json');

    });
  })
});
