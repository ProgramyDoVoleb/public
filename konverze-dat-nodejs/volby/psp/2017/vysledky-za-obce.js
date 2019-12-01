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

var regionFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/volby/psp/2017/strany.json', function(err, content) {
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

function processTown (nuts, town, results) {


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

    var o = json.volby.snemovna.find(k => k.year === 2017);

    if (!o) {
      o = {};
      json.volby.snemovna.push(o);
    }

    o.year = 2017;
    o.stats = {
        voters: Number(results.UCAST[0].$.ZAPSANI_VOLICI),
        pct: Number(results.UCAST[0].$.UCAST_PROC)
    };
    o.result = [];

    results.HLASY_STRANA.forEach(result => {

      var r = {
          id: Number(result.$.KSTRANA),
          votes: Number(result.$.HLASY),
          pct: Number(result.$.PROC_HLASU)
      }

      var info = undefined;

      cis.list.forEach(c => {

        if (c.id) {
          var cx = c.id.find(cx0 => cx0 === r.id);

          if (cx) info = c;
        }
      });

      if (info) {
        r.reg = info.reg;
        r.name = info.name;
      }

      o.result.push(r);
    });

    writeJSON(json, file);
  });
}

function processNuts (nuts) {

  new Promise (function (resolve, reject) {
    fs.readFile('../zdroje/volby/psp/2017/data/' + nuts + '.xml', function(err, content) {
      parser.parseString(content, function (err, json) {
        resolve(json);
      });
    });
  }).then (function (result) {
    result.VYSLEDKY_OKRES.OBEC.forEach(obec => {
      processTown(nuts, obec.$.CIS_OBEC, obec);
    });
  });
}

Promise.all([hierarchyFile, regionFile]).then(function (values) {
  var cz = values[0].hierarchy.list;

  cis = values[1];

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
});
