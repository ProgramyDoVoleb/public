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

var candidatesFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/volby/p/2018/kandidati.json', function(err, content) {
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

function processTown (nuts, town, round1, round2, cis) {

  if (nuts === "CZ010") nuts = "CZ0100";

  var file = '../data/obecne/obce/' + nuts + '/' + town + '.json';

  new Promise (function (resolve, reject) {
    fs.readFile(file, function(err, content) {
        if (!content || content === "undefined") {
          console.log(nuts, town);
        } else {
          try {
            resolve(JSON.parse(content));
          } catch (e) {
            console.log("JSON ERROR", nuts, town);
          }
        }

    });
  }).then (function (json) {

    var o = json.volby.prezident.find(k => k.year === 2018);

    if (!o) {
      o = {};
      json.volby.prezident.push(o);
    }

    o.year = 2018;

    o.round1 = {
      votes: Number(round1.UCAST[0].$.PLATNE_HLASY),
      voters: Number(round1.UCAST[0].$.ZAPSANI_VOLICI),
      attended: Number(round1.UCAST[0].$.VYDANE_OBALKY),
      candidates: []
    };

    o.round2 = {
      votes: Number(round2.UCAST[0].$.PLATNE_HLASY),
      voters: Number(round2.UCAST[0].$.ZAPSANI_VOLICI),
      attended: Number(round2.UCAST[0].$.VYDANE_OBALKY),
      candidates: []
    };

    round1.HODN_KAND.forEach(candidate => {
      o.round1.candidates.push({
        id: Number(candidate.$.PORADOVE_CISLO),
        name: cis.list.find(p => p.id === Number(candidate.$.PORADOVE_CISLO)).name,
        votes: Number(candidate.$.HLASY),
        pct: Math.round(Number(candidate.$.HLASY) / o.round1.votes * 10000) / 100
      });
    });

    round2.HODN_KAND.forEach(candidate => {
      o.round2.candidates.push({
        id: Number(candidate.$.PORADOVE_CISLO),
        name: cis.list.find(p => p.id === Number(candidate.$.PORADOVE_CISLO)).name,
        votes: Number(candidate.$.HLASY),
        pct: Math.round(Number(candidate.$.HLASY) / o.round2.votes * 10000) / 100
      });
    });

    writeJSON(json, file);
  });
}

function processNuts (nuts, cis) {

  var round1 = new Promise (function (resolve, reject) {
    fs.readFile('../zdroje/volby/p/2018/data/1/' + nuts + '.xml', function(err, content) {
      parser.parseString(content, function (err, json) {
        resolve(json);
      });
    });
  });

  var round2 = new Promise (function (resolve, reject) {
    fs.readFile('../zdroje/volby/p/2018/data/2/' + nuts + '.xml', function(err, content) {
      parser.parseString(content, function (err, json) {
        resolve(json);
      });
    });
  });

  Promise.all([round1, round2]).then(function (values) {
    var round1 = values[0];
    var round2 = values[1];

    round1.VYSLEDKY_KRAJ.KRAJ[0].OKRES.forEach((okres, okresID) => {
      okres.OBEC.forEach((obec, obecID) => {

        var round1Obec = obec;
        var round2Obec = round2.VYSLEDKY_KRAJ.KRAJ[0].OKRES.find(ok => ok.$.NUTS_OKRES === okres.$.NUTS_OKRES).OBEC.find(ob => ob.$.CIS_OBEC === obec.$.CIS_OBEC);

        processTown(okres.$.NUTS_OKRES, obec.$.CIS_OBEC, round1Obec, round2Obec, cis);

      });
    });
  });
}

Promise.all([hierarchyFile, candidatesFile]).then(function (values) {
  var cz = values[0].hierarchy.list;

  cis = values[1];

  var list = [];

  cz.forEach((reg, i0) => {
    reg.list.forEach((kraj, i1) => {

      var nuts = kraj.nuts;

      if (nuts) {
        processNuts(nuts, cis);
      }
    })
  })

  // processNuts("CZ010");
});
