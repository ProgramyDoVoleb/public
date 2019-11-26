var fs = require('fs'),
    iconv = require('iconv-lite');

fs.createReadStream('../zdroje/obecne/epcoco.xml')
    .pipe(iconv.decodeStream('win1250'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje/obecne/epcoco-utf8.xml'));
