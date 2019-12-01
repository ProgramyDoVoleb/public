var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var dates = [
  {date: 20081017, type: 0},
  {date: 20101015, type: 0},
  {date: 20110318, type: 1},
  {date: 20121012, type: 0},
  {date: 20140110, type: 1},
  {date: 20140919, type: 1},
  {date: 20141010, type: 0},
  {date: 20161007, type: 0},
  {date: 20170127, type: 1},
  {date: 20180105, type: 1},
  {date: 20180518, type: 1},
  {date: 20181005, type: 0},
  {date: 20190405, type: 1}
];

var cvs;

function writeResults (json, file) {

  var dir = "../data/volby/senat/" + file;

  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  }

  fs.writeFile(dir + '/kandidati.json', JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved:", file);
  });
}

function processFile (result, cvs, vote) {
  var json = {
    created: new Date().getTime(),
    list: []
  }

  result.SE_REGKAND.SE_REGKAND_ROW.forEach(function (row) {

    var person = {
      id: Number(row.CKAND[0]),
      reg: Number(row.OBVOD[0]),
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

  writeResults(json, vote.date);
}

dates.forEach(vote => {
  new Promise (function (resolve, reject) {
    fs.readFile('../zdroje/volby/senat/' + vote.date + '/serk-utf8.xml', function(err, data) {
      parser.parseString(data, function (err, json) {
        resolve(json);
      });
    })
  }).then(result => {
    processFile(result, undefined, vote);
  });
});
