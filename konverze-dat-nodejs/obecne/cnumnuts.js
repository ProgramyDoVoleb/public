var fs = require('fs'),
    iconv = require('iconv-lite');

fs.createReadStream('../zdroje/obecne/cnumnuts.xml')
    .pipe(iconv.decodeStream('win1250'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje/obecne/cnumnuts-utf8.xml'));
