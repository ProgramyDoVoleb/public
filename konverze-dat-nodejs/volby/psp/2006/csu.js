var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var unzipper = require('unzipper');

var date = 2006;

var dir = "../zdroje/volby/psp/" + date;

request.get('https://volby.cz/pls/ps' + date + '/vysledky')
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream(dir + '/vysledky.xml'));

request.get('https://volby.cz/pls/ps' + date + '/vysledky_krajmesta')
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream(dir + '/vysledky_krajmesta.xml'));

request.get('https://volby.cz/pls/ps' + date + '/vysledky_zahranici')
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream(dir + '/vysledky_zahranici.xml'));

request.get('https://volby.cz/opendata/ps2006/PS2006reg2006.zip')
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {
          const fileName = entry.path;

          entry.pipe(iconv.decodeStream('us-ascii'))
          .pipe(iconv.encodeStream('utf8'))
          .pipe(fs.createWriteStream(dir + '/' + entry.path));
        })

request.get('https://volby.cz/opendata/ps2006/PS2006ciselniky2006.zip')
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {
          const fileName = entry.path;

          entry.pipe(iconv.decodeStream('us-ascii'))
          .pipe(iconv.encodeStream('utf8'))
          .pipe(fs.createWriteStream(dir + '/' + entry.path));
        })

// GENERIC

function readXML (nuts) {
  var nuts2 = nuts;
  if (nuts.substring(0, 5) === 'CZ063') nuts2 = nuts.split('063').join('061');
  if (nuts.substring(0, 5) === 'CZ064') nuts2 = nuts.split('064').join('062');

  console.log(nuts2);

  request.get('https://volby.cz/pls/ps' + date + '/vysledky_okres?nuts=' + nuts2)
         .pipe(iconv.decodeStream('iso-8859-2'))
         .pipe(iconv.encodeStream('utf8'))
         .pipe(fs.createWriteStream(dir + '/data/' + nuts + ".xml"));
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
