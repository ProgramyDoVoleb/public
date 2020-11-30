var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');

request.get('https://data.programydovoleb.cz/volby/psrk.xml')
        .pipe(iconv.decodeStream('windows-1250'))
        .pipe(iconv.encodeStream('utf8'))
        .pipe(fs.createWriteStream('zdroje/volby/psp/2021/sweep/psrk.xml'));
