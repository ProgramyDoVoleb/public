var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

function writeResults (json) {
  fs.writeFile("../data/volby/psp/2010/strany.json", JSON.stringify(json), function(err) {

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
  fs.readFile('../zdroje/volby/psp/2010/psrkl.xml', function(err, data) {
    parser.parseString(data, function (err, json) {
      resolve(json);
    });
  });
});

Promise.all([allPartiesFile, resultsFile]).then(function (values) {

  try {
  var allParties = [];

  values[1].PS_RKL.PS_RKL_ROW.forEach(function (row) {


    var item = values[0].list.find((item) => Number(item.reg) === Number(row.VSTRANA[0]));

    if (item) {
      if (item.coalition) {

        item.coalition.forEach(party => {
          if (allParties.indexOf(party) === -1) allParties.push(party);
        });
      }
    } else {
      values[0].list.push({
        reg: Number(row.VSTRANA[0]),
        name: row.NAZEVCELK[0],
        short: row.ZKRATKAK8[0],
        links: []
      });

      console.log("Dynamically creating a party:", Number(row.VSTRANA[0]), row.ZKRATKAK8[0])
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

    var id = values[1].PS_RKL.PS_RKL_ROW.filter(i => Number(i.VSTRANA[0]) === o.reg);

    if (id.length > 0) {

      if (o.name != id[0].NAZEVCELK[0]) {
        o.oldName = id[0].NAZEVCELK[0];
        o.oldShort = id[0].ZKRATKAK8[0];
      }

      o.id = [];

      id.forEach(idx => {
        o.id.push(Number(idx.KSTRANA[0]));
      })
    }

    json.list.push(o)
  });

  writeResults(json);

  } catch (e) {
    console.log(e);
  }

});
