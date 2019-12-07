var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

function writeResults (json) {
  fs.writeFile("../data/volby/ep/2009/strany.json", JSON.stringify(json), function(err) {

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
  fs.readFile('../zdroje/volby/ep/2009/eprkl.xml', function(err, data) {
    parser.parseString(data, function (err, json) {
      resolve(json);
    });
  });
});

Promise.all([allPartiesFile, resultsFile]).then(function (values) {
  var allParties = [];

  values[1].EP_RKL.EP_RKL_ROW.forEach(function (row) {

    var item = values[0].list.find((item) => Number(item.reg) === Number(row.VSTRANA[0]));

    if (!item) {

      item = {};

      var slozeni = row.SLOZENI[0].split(",").map(x => Number(x));

      if (slozeni.length > 1) item.coalition = slozeni;
    }

    if (item.coalition) {
      item.coalition.forEach(party => {
        if (allParties.indexOf(party) === -1) allParties.push(party);
      });
    }

    if (allParties.indexOf(Number(row.VSTRANA[0])) === -1) allParties.push(Number(row.VSTRANA[0]));
  });

  allParties.sort((a, b) => a - b);

  var json = {
    created: new Date().getTime(),
    list: []
  };

  allParties.forEach(party => {
    var o = values[0].list.find(p => p.reg === party);

    if (!o) {

      var x = values[1].EP_RKL.EP_RKL_ROW.filter(i => Number(i.VSTRANA[0]) === party)[0];

      o = {
        reg: Number(x.VSTRANA[0]),
        name: x.NAZEVCELK[0]
      }
    }

    var id = values[1].EP_RKL.EP_RKL_ROW.filter(i => Number(i.VSTRANA[0]) === o.reg);

    if (id.length > 0) {
      o.id = [];

      id.forEach(idx => {
        o.id.push(Number(idx.ESTRANA[0]));
      })
    }

    json.list.push(o)
  });

  writeResults(json);
});
