var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var unzipper = require('unzipper');

const source = 'https://volby.cz/pls/kz2004/kz111?xjazyk=CZ&xdatum=20041105&xstrana=0&xv=2&xt=1&xkraj=';
const dir = '../../zdroje/volby/kv/2004/';

for (var i = 1; i < 14; i++) {
  request.get(source + i)
    .pipe(iconv.decodeStream('iso-8859-2'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream(dir + '/mandaty/' + i + '.html'));
}
