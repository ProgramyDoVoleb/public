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
  fs.readFile('../data/volby/kom/2018/vysledky.json', function(err, content) {
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

  o.results = [];

  results.VOLEBNI_STRANA.forEach(party => {
    var p = {
      id: Number(party.$.POR_STR_HLAS_LIST),
      votes: Number(party.$.HLASY),
      pct: Number(party.$.HLASY_PROC),
      reg: Number(party.$.VSTRANA)
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

function processTown (nuts, town, result) {

  var file = '../data/obecne/obce/' + nuts + '/' + town + '.json';

  new Promise (function (resolve, reject) {
    fs.readFile(file, function(err, content) {
        if (!content || content === "undefined") {
          console.log(nuts, town);
        } else {
          resolve(JSON.parse(content));
        }

    });
  }).then (function (json) {

    var o = json.volby.obce.find(k => k.year === 2018);

    if (!o) {
      o = {};
      json.volby.obce.push(o);
    }

    o.year = 2018;
    o.parts = [];
    o.results = undefined;

    try {

      if (result.$.POCET_OBVODU && Number(result.$.POCET_OBVODU) > 1) {

        result.OBVOD.forEach(part => {
          var p = {
            id: Number(part.$.CIS_OBVODU)
          };

          processPart(part.VYSLEDEK[0], p)

          o.parts.push(p);
        });

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
    fs.readFile('../zdroje/volby/kom/2018/data/' + nuts + '.xml', function(err, content) {
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
