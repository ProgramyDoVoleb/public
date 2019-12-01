var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

function writeResults (json) {
  fs.writeFile("../data/obecne/senatni-obvody.json", JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

var areaFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/obecne/secobv-utf8.xml', function(err, content) {
    parser.parseString(content, function (err, json) {
      resolve(json);
    });
  });
});

Promise.all([areaFile]).then(function (values) {
  var xml = values[0];
  var json = {
    created: new Date().getTime(),
    list: []
  }

  xml.SE_COBV.SE_COBV_ROW.forEach(area => {
    var o = {
      id: Number(area.OBVOD[0]),
      name: area.NAZEV_OBV[0],
      okres: Number(area.OKRES[0]),
      lineup: Number(area.PRVNI_VO[0]),
      towns: [],
      votes: []
    }

    json.list.push(o);

  });

  writeResults(json);

});
