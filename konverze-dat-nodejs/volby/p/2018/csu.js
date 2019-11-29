var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');

fs.createReadStream('../zdroje/volby/p/2018/perk.xml')
    .pipe(iconv.decodeStream('windows1250'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje/volby/p/2018/perk-utf8.xml'));

request.get('https://volby.cz/pls/prez2018/vysledky')
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream('../zdroje/volby/p/2018/vysledky.xml'));

request.get('https://volby.cz/pls/prez2018/vysledky_zahranici')
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream('../zdroje/volby/p/2018/vysledky-zahranici.xml'));

function readXML (nuts) {
  request.get('https://volby.cz/pls/prez2018/vysledky_kraj?kolo=1&nuts=' + nuts)
         .pipe(iconv.decodeStream('iso-8859-2'))
         .pipe(iconv.encodeStream('utf8'))
         .pipe(fs.createWriteStream('../zdroje/volby/p/2018/data/1/' + nuts + ".xml"));

  request.get('https://volby.cz/pls/prez2018/vysledky_kraj?kolo=2&nuts=' + nuts)
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream('../zdroje/volby/p/2018/data/2/' + nuts + ".xml"));
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

      var nuts = kraj.nuts;

      if (nuts) readXML(nuts);
    })
  })

  // readXML("CZ0201");
});
