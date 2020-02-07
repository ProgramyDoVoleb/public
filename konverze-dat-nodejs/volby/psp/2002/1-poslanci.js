var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var unzipper = require('unzipper');

var date = 2002;

const source = 'https://volby.cz/pls/ps2002/ps111?xjazyk=CZ&xv=2&xt=1&xkstrana=0&xkraj=0';
const dir = '../../zdroje/volby/psp/2002/';

request.get(source)
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream(dir + '/mandaty/poslanci.html'));
