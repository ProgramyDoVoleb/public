var fs = require('fs'),
    iconv = require('iconv-lite');

fs.createReadStream('../zdroje/volby/kv/2016/kzrkl_s.xml')
    .pipe(iconv.decodeStream('win1250'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('../zdroje/volby/kv/2016/kzrkl_s-utf8.xml'));
