var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

function writeFile (json, to) {
  fs.writeFile(to, JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }
  });
}

var cz = JSON.parse(fs.readFileSync('../data/obecne/obce-struktura.json'));

function y(year) {
  return new Promise (function (resolve, reject) {
    fs.readFile('../zdroje/volby/kom/' + year + '/kvrzcoco.xml', function(err, content) {
      parser.parseString(content, function (err, json) {
        resolve(json);
      });
    });
  })
}

function processNum (values, num, nuts) {
  var file = '../data/souhrny/obce/' + nuts + '/' + num + '.json';

  var json = JSON.parse(fs.readFileSync(file));

  if (!json.stats) json.stats = {};

  json.stats.population = [];
  json.stats.seats = 0;
  json.stats.type = 0;
  json.stats.typeOf = 0;

  values.forEach((v, index) => {
    var data = v.KV_RZCOCO.KV_RZCOCO_ROW.find(row => Number(row.KODZASTUP[0]) === num);

    if (data) {
      json.stats.seats = Number(data.MANDATY[0]);
      json.stats.type = Number(data.TYPZASTUP[0]);
      json.stats.typeOf = Number(data.DRUHZASTUP[0]);
      json.stats.population.push({
        year: 2006 + index * 4,
        value: Number(data.POCOBYV[0])
      });
    }
  });

  writeFile(json, file);
}

Promise.all([y(2006), y(2010), y(2014), y(2018)]).then(function (values) {
  cz.hierarchy.list.forEach(reg => {
    reg.list.forEach(kraj => {
      kraj.list.forEach(okres => {
        okres.list.forEach(obec => {
          processNum(values, obec.num, okres.nuts || 'CZ0100');

          if (obec.list) {
            obec.list.forEach(part => {
              processNum(values, part.num, okres.nuts || 'CZ0100');
            });
          }
        });
      });
    });
  })
});
