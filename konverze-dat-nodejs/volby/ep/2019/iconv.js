var fs = require('fs'),
    iconv = require('iconv-lite');

fs.createReadStream('../zdroje/volby/eu/2019/eprkl.xml')
    .pipe(iconv.decodeStream('iso-8859-2'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje/volby/eu/2019/eprkl-utf8.xml'));

fs.createReadStream('../zdroje/volby/eu/2019/vysledky.xml')
    .pipe(iconv.decodeStream('iso-8859-2'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje/volby/eu/2019/vysledky-utf8.xml'));
