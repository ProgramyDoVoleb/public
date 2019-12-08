var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var builder = new xml2js.Builder();

var reg = undefined;

function writeResults (data) {
  fs.writeFile("../zdroje/volby/psp/2006/psrkl.xml", builder.buildObject(data), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

var dbfFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/volby/psp/2006/PSRKL.dbf', function(err, data) {
    resolve(data);
  });
});

function processSlice (data) {
  return {
    KSTRANA: data.slice(0, 3).trim(),
    VSTRANA: data.slice(3, 6).trim(),
    SLOZENI: data.slice(216, 246).trim(),
    NAZEVCELK: data.slice(6, 126).trim(),
    ZKRATKAK8: data.slice(206, 214).trim()
  }
}

Promise.all([dbfFile]).then(function (values) {
  var dbfFile = values[0].toString();

  var slices = [];

  var rowLength = 314;
  var offset = 418;

  for (var i = 0; i < dbfFile.length / rowLength - 2; i++) {
    slices.push(dbfFile.slice(i * rowLength + offset, i * rowLength + rowLength + offset));
  }

  var data = {
    PS_RKL: {
      PS_RKL_ROW: []
    }
  }

  slices.forEach(sl => {
    console.log(sl);
    data.PS_RKL.PS_RKL_ROW.push(processSlice(sl));
  });

  writeResults(data);
});
