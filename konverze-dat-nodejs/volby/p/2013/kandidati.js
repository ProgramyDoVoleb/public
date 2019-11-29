var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

function writeResults (json) {
  fs.writeFile("../data/volby/p/2013/kandidati.json", JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

var allPartiesFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/strany.json', function(err, data) {
    resolve(JSON.parse(data));
  });
});

var resultsFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/volby/p/2013/perk-utf8.xml', function(err, data) {
    parser.parseString(data, function (err, json) {
      resolve(json);
    });
  });
});

Promise.all([allPartiesFile, resultsFile]).then(function (values) {
  var json = {
    created: new Date().getTime(),
    list: []
  };

  values[1].PE_REGKAND.PE_REGKAND_ROW.forEach(function (row) {

    var person = {
      id: Number(row.CKAND[0]),
      name: [row.TITULPRED ? row.TITULPRED[0] : "", row.JMENO[0], row.PRIJMENI[0], row.TITULZA ? row.TITULZA[0] : ""],
      age: Number(row.VEK[0]),
      work: row.POVOLANI[0],
      from: row.BYDLISTEN[0],
      fromID: Number(row.BYDLISTEK[0]),
      member: Number(row.PSTRANA[0]),
      nomimee: Number(row.NSTRANA[0])
    }

    json.list.push(person)
  });

  writeResults(json);
});
