var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

function writeResults (json) {
  fs.writeFile("../data/volby/kom/2018/vysledky.json", JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

var cvsFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/strany.json', function(err, data) {
    resolve(JSON.parse(data));
  });
});

var townsFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/obce.json', function(err, data) {
    resolve(JSON.parse(data));
  });
});

var resultsFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/volby/kom/2018/kvros-utf8.xml', function(err, data) {
    parser.parseString(data, function (err, json) {
      resolve(json);
    });
  });
});

Promise.all([townsFile, resultsFile, cvsFile]).then(function (values) {

  var towns = values[0];
  var results = values[1];
  var cvs = values[2];

  var json = {
    created: new Date().getTime(),
    list: towns.areas
  };

  json.list.forEach(area => area.list = []);

  results.KV_ROS.KV_ROS_ROW.forEach(record => {
    var area = json.list.find(a => a.id === Number(record.OKRES[0] === "1100" ? 1199 : record.OKRES[0]));

    if (area) {
      var town = area.list.find(t => t.id === Number(record.KODZASTUP[0]));

      if (!town) {
          town = {
            id: Number(record.KODZASTUP[0]),
            name: record.NAZEVZAST[0],
            parties: []
          };

          area.list.push(town);
      }

      var party = {
        id: Number(record.POR_STR_HL[0]),
        reg: Number(record.VSTRANA[0]),
        local: Number(record.OSTRANA[0]),
        name: record.NAZEVCELK[0],
        short: record.ZKRATKAO8 ? record.ZKRATKAO8[0] : record.ZKRATKAO30[0],
        votes: record.HLASY_STR ? Number(record.HLASY_STR[0]) : 0,
        pct: record.PROCHLSTR ? Number(record.PROCHLSTR[0]) : 0,
        seats: record.MAND_STR ? Number(record.MAND_STR[0]) : 0
      }

      if (Number(record.POCSTR_SLO[0]) > 1) party.coalition = record.SLOZENI[0].split(",").map(p => Number(p));

      town.parties.push(party);

    } else {
      console.log("Okres nenalezen", record.OKRES[0]);
    }

  });

  writeResults(json);

});
