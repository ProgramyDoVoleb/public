var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');

fs.createReadStream('../zdroje/obecne/secobv.xml')
    .pipe(iconv.decodeStream('windows1250'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje//obecne/secobv-utf8.xml'));
