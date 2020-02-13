var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var unzipper = require('unzipper');

const source = 'https://volby.cz/pls/kz2000/XXXX?xjazyk=CZ&xdatum=20001112';
const dir = '../zdroje/volby/kv/2000/';

request.get(source.split("XXXX").join('kz82'))
  .pipe(iconv.decodeStream('iso-8859-2'))
  .pipe(iconv.encodeStream('utf8'))
  .pipe(fs.createWriteStream(dir + 'listiny.html'));

request.get(source.split("XXXX").join('kz83'))
  .pipe(iconv.decodeStream('iso-8859-2'))
  .pipe(iconv.encodeStream('utf8'))
  .pipe(fs.createWriteStream(dir + 'strany.html'));
