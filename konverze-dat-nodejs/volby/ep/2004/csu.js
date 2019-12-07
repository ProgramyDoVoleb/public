var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var unzipper = require('unzipper');

var date = 2004;

var dir = "../zdroje/volby/ep/" + date;

request.get('https://volby.cz/pls/ep' + date + '/vysledky')
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream(dir + '/vysledky.xml'));

request.get('https://volby.cz/opendata/ep2004/EP2004reg.zip')
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {
          const fileName = entry.path;

          entry.pipe(iconv.decodeStream('windows-1250'))
          .pipe(iconv.encodeStream('utf8'))
          .pipe(fs.createWriteStream(dir + '/' + entry.path));
        })

request.get('https://volby.cz/opendata/ep2004/EP2004ciselniky.zip')
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {
          const fileName = entry.path;

          entry.pipe(iconv.decodeStream('windows-1250'))
          .pipe(iconv.encodeStream('utf8'))
          .pipe(fs.createWriteStream(dir + '/' + entry.path));
        })

// GENERIC

function readXML (nuts) {
  request.get('https://volby.cz/pls/ep2004/vysledky_okres?nuts=' + nuts)
         .pipe(iconv.decodeStream('iso-8859-2'))
         .pipe(iconv.encodeStream('utf8'))
         .pipe(fs.createWriteStream('../zdroje/volby/ep/2004/data/' + nuts + ".xml"));
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
