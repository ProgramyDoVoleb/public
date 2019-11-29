var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');

fs.createReadStream('../zdroje/volby/psp/2017/psrkl.xml')
    .pipe(iconv.decodeStream('iso-8859-2'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje/volby/psp/2017/psrkl-utf8.xml'));

request.get('https://volby.cz/pls/ps2017nss/vysledky')
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream('../zdroje/volby/psp/2017/vysledky.xml'));

request.get('https://volby.cz/pls/ps2017nss/vysledky_zahranici')
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream('../zdroje/volby/psp/2017/vysledky-zahranici.xml'));

function readXML (nuts) {
  request.get('https://volby.cz/pls/ps2017nss/vysledky_okres?nuts=' + nuts)
         .pipe(iconv.decodeStream('iso-8859-2'))
         .pipe(iconv.encodeStream('utf8'))
         .pipe(fs.createWriteStream('../zdroje/volby/psp/2017/data/' + nuts + ".xml"));
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
