var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');

var date = 20190405;
var files = [0, 0];
var full = false;

if (process.argv.length === 3) {
  date = Number(process.argv[2]);

  console.log("Setup:", date);
}

if (process.argv.length === 6) {
  date = Number(process.argv[2]);
  files[0] = Number(process.argv[3]);
  files[1] = Number(process.argv[4]);
  full = Number(process.argv[5]) === 1;

  console.log("Setup:", date, files, full);
}

var dir = "../zdroje/volby/senat/" + date;

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

if (!fs.existsSync(dir + "/data")){
    fs.mkdirSync(dir + "/data");
}

// https://volby.cz/pls/senat/vysledky?datum_voleb=20190405

request.get('https://volby.cz/pls/senat/vysledky?datum_voleb=' + date)
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream(dir + '/vysledky.xml'));

// https://volby.cz/pls/senat/vysledky_okrsky?datum_voleb=20190405&kolo=2&davka=11

function readFeed (round, file) {
  request.get('https://volby.cz/pls/senat/vysledky_okrsky?datum_voleb=' + date + '&kolo=' + round + '&davka=' + file)
         .pipe(iconv.decodeStream('iso-8859-2'))
         .pipe(iconv.encodeStream('utf8'))
         .pipe(fs.createWriteStream(dir + "/data/round" + round + "_" + file + ".xml"));
}

function readRound (round) {
  for (var i = 0; i < files[round - 1]; i++) {
    readFeed(round, i + 1);
  }
}

if (full) {
  readRound(1);
  readRound(2);
}
