var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var unzipper = require('unzipper');

request.get('https://volby.cz/opendata/kv2010/KV2010reg20140903.zip')
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {
          const fileName = entry.path;

        entry.pipe(iconv.decodeStream('windows-1250'))
          .pipe(iconv.encodeStream('utf8'))
          .pipe(fs.createWriteStream('../zdroje/volby/kom/2010/' + entry.path));
        })

request.get('https://volby.cz/opendata/kv2010/KV2010ciselniky20140903.zip')
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {
          const fileName = entry.path;

        entry.pipe(iconv.decodeStream('windows-1250'))
          .pipe(iconv.encodeStream('utf8'))
          .pipe(fs.createWriteStream('../zdroje/volby/kom/2010/' + entry.path));
        })

function readXML (nuts) {
  request.get('https://volby.cz/pls/kv2010/vysledky_obce_okres?datumvoleb=20101015&nuts=' + nuts)
         .pipe(iconv.decodeStream('iso-8859-2'))
         .pipe(iconv.encodeStream('utf8'))
         .pipe(fs.createWriteStream('../zdroje/volby/kom/2010/data/' + nuts + ".xml"));
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
