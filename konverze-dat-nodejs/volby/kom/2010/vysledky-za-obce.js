var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var cis = undefined;

var hierarchyFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/obce-struktura.json', function(err, content) {
    resolve(JSON.parse(content));
  });
});

var resultsFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/volby/kom/2010/vysledky.json', function(err, content) {
    resolve(JSON.parse(content));
  });
});

function writeJSON (json, file) {
  fs.writeFile(file, JSON.stringify(json), function(err) {
      if(err) {
          return console.log(err);
      }
  });
}

function processPart (results, o) {

  o.stats = {
    voters: Number(results.UCAST[0].$.ZAPSANI_VOLICI),
    pct: Number(results.UCAST[0].$.UCAST_PROC)
  };

  o.stats.attended = Math.floor(o.stats.voters * o.stats.pct / 100);

  o.results = [];

  results.VOLEBNI_STRANA.forEach(party => {
    var p = {
      id: Number(party.$.POR_STR_HLAS_LIST),
      votes: Number(party.$.HLASY),
      pct: Number(party.$.HLASY_PROC),
      reg: Number(party.$.VSTRANA),
      name: party.$.NAZEV_STRANY
    };

    if (party.ZASTUPITEL) {
      p.list = [];

      party.ZASTUPITEL.forEach(member => {
        var m = {
          id: Number(member.$.PORADOVE_CISLO),
          name: [member.$.TITULPRED, member.$.JMENO, member.$.PRIJMENI, member.$.TITULZA]
        }

        p.list.push(m);
      });
    }

    o.results.push(p);
  });
}

function processSegments (segments) {

  var obj = {
    stats: {
      voters: 0,
      attended: 0,
      pct: 0,
      votes: 0
    },
    results: []
  }

  segments.forEach(segment => {
    obj.stats.voters += segment.stats.voters;
    obj.stats.attended += segment.stats.attended;

    segment.results.forEach(party => {
      var partySum = obj.results.find(p => p.reg === party.reg);

      if (!partySum) {
        obj.results.push(party);
      } else {
        partySum.votes += party.votes;
        if (party.list && !partySum.list) partySum.list = [];
        if (party.list) party.list.forEach(l => partySum.list.push(l));
      }

      obj.stats.votes += party.votes;
    });
  });

  obj.stats.pct = Math.round(10000 * obj.stats.attended / obj.stats.voters) / 100;

  obj.results.forEach(party => {
    party.pct = Math.round(10000 * party.votes / obj.stats.votes) / 100;
  });

  return obj;
}

function processTown (nuts, town, result) {

  var file = '../data/souhrny/obce/' + nuts + '/' + town + '.json';

  new Promise (function (resolve, reject) {
    fs.readFile(file, function(err, content) {
        if (!content || content === "undefined") {

          var o = {
            id: Number(town),
            name: result.$.NAZEVZAST,
            nuts: nuts,
            volby: {
              prezident: [],
              snemovna: [],
              senat: [],
              kraje: [],
              obce: [],
              eu: []
            }
          }

          console.log("Nová obec:", o.nuts, o.name)

          resolve(o);
        } else {
          try {
            resolve(JSON.parse(content));
          } catch (e) {
            console.log("JSON ERROR", nuts, town);
          }
        }

    });
  }).then (function (json) {

    var o = json.volby.obce.find(k => k.year === 2010);

    if (!o) {
      o = {};
      json.volby.obce.push(o);
    }

    o.year = 2010;
    o.parts = [];
    o.segments;
    o.results = undefined;

    try {

      if (result.$.POCET_OBVODU && Number(result.$.POCET_OBVODU) > 1) {

        o.segments = [];

        result.OBVOD.forEach(part => {
          var p = {
            id: Number(part.$.CIS_OBVODU)
          };

          processPart(part.VYSLEDEK[0], p)

          o.segments.push(p);
        });

        o.parts.push(processSegments(o.segments));

      } else {
        var p = {};

        processPart(result.VYSLEDEK[0], p)

        o.parts.push(p);
      }

    } catch (e) {

      console.log("Chyba", nuts, town, result)

    }

    writeJSON(json, file);
  });
}

function processNuts (nuts) {

  new Promise (function (resolve, reject) {
    fs.readFile('../zdroje/volby/kom/2010/data/' + nuts + '.xml', function(err, content) {
      parser.parseString(content, function (err, json) {
        resolve(json);
      });
    });
  }).then (function (result) {
    result.VYSLEDKY_OBCE_OKRES.OBEC.forEach(obec => {
      processTown(nuts, obec.$.KODZASTUP, obec);
    });
  });
}

Promise.all([hierarchyFile]).then(function (values) {
  var cz = values[0].hierarchy.list;

  var list = [];

  cz.forEach((reg, i0) => {
    reg.list.forEach((kraj, i1) => {

      kraj.list.forEach((okres, i2) => {

        var nuts = okres.nuts;

        if (nuts) {
          processNuts(nuts);
        }
      });
    })
  })

  // processNuts("CZ020A");
});
