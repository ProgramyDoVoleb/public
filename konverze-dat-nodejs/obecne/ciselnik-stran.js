var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');

request.get('https://volby.cz/pls/senat/se52?xjazyk=CZ&xdatum=19961116')
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream('../zdroje/obecne/ciselnik-volebnich-stran-a-koalic.html'));

request.get('https://volby.cz/pls/senat/se54?xjazyk=CZ&xdatum=19961116')
        .pipe(iconv.decodeStream('iso-8859-2'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream('../zdroje/obecne/ciselnik-volebnich-stran.html'));
