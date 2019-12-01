var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');

fs.createReadStream('../zdroje/volby/kom/2018/kvros.xml')
    .pipe(iconv.decodeStream('windows-1250'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje/volby/kom/2018/kvros-utf8.xml'));

fs.createReadStream('../zdroje/volby/kom/2018/kvrzcoco.xml')
    .pipe(iconv.decodeStream('windows-1250'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje/volby/kom/2018/kvrzcoco-utf8.xml'));

function readXML (nuts) {
  request.get('https://volby.cz/pls/kv2018/vysledky_obce_okres?datumvoleb=20181005&nuts=' + nuts)
         .pipe(iconv.decodeStream('iso-8859-2'))
         .pipe(iconv.encodeStream('utf8'))
         .pipe(fs.createWriteStream('../zdroje/volby/kom/2018/data/' + nuts + ".xml"));
}

var hierarchyFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/obce-struktura.json', function(err, content) {
    resolve(JSON.parse(content));
  });
});

Promise.all([hierarchyFile]).then(function (values) {
  var cz = values[0].hierarchy.list;

  cz.forEach(reg => {
    reg.list.forEach(kraj => {

      kraj.list.forEach(okres => {

        var nuts = okres.nuts;

        if (nuts) readXML(nuts);
      });
    })
  })

  // readXML("CZ0201");
});
