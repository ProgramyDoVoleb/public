var fs = require('fs'),
    iconv = require('iconv-lite');

fs.createReadStream('../zdroje/volby/kv/2012/kzrkl_s.dbf')
    .pipe(iconv.decodeStream('iso-8859-2'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje/volby/kv/2012/kzrkl_s-utf8.dbf'));
