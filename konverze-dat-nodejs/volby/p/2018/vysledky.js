var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

function writeResults (json) {
  fs.writeFile("../data/volby/p/2018/vysledky.json", JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

var candidatesFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/volby/p/2018/kandidati.json', function(err, data) {
    resolve(JSON.parse(data));
  });
});

var resultsFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/volby/p/2018/vysledky.xml', function(err, data) {
    parser.parseString(data, function (err, json) {
      resolve(json);
    });
  });
});

Promise.all([candidatesFile, resultsFile]).then(function (values) {

  var candidates = values[0];
  var result = values[1];

  var json = {
    round1: {
      votes: Number(result.VYSLEDKY.CR[0].UCAST[0].$.PLATNE_HLASY),
      voters: Number(result.VYSLEDKY.CR[0].UCAST[0].$.ZAPSANI_VOLICI),
      attended: Number(result.VYSLEDKY.CR[0].UCAST[0].$.VYDANE_OBALKY),
      candidates: []
    },
    round2: {
      votes: Number(result.VYSLEDKY.CR[0].UCAST[1].$.PLATNE_HLASY),
      voters: Number(result.VYSLEDKY.CR[0].UCAST[1].$.ZAPSANI_VOLICI),
      attended: Number(result.VYSLEDKY.CR[0].UCAST[1].$.VYDANE_OBALKY),
      candidates: []
    },
    winner: []
  };

  result.VYSLEDKY.CR[0].KANDIDAT.forEach(person => {

    var r1 = {
      id: Number(person.$.PORADOVE_CISLO),
      name: [person.$.TITULPRED, person.$.JMENO, person.$.PRIJMENI, person.$.TITULZA],
      votes: Number(person.$.HLASY_1KOLO),
      pct: Number(person.$.HLASY_PROC_1KOLO),
      progress: person.$.ZVOLEN_1KOLO != "NEZVOLEN"
    };

    json.round1.candidates.push(r1);

    if (r1.progress === true) {

      var r2 = {
        id: Number(person.$.PORADOVE_CISLO),
        name: [person.$.TITULPRED, person.$.JMENO, person.$.PRIJMENI, person.$.TITULZA],
        votes: Number(person.$.HLASY_2KOLO),
        pct: Number(person.$.HLASY_PROC_2KOLO),
        progress: person.$.ZVOLEN_2KOLO != "NEZVOLEN"
      }

      json.round2.candidates.push(r2);

      if (r2.progress === true) {

        var r3 = candidates.list.find(cand => cand.id === r2.id);

        r3.stats = {
          round1: {
            votes: r1.votes,
            pct: r1.pct
          },
          round2: {
            votes: r2.votes,
            pct: r2.pct
          }
        }

        json.winner.push(r3);

      }

    }
  });

  writeResults(json);

});
