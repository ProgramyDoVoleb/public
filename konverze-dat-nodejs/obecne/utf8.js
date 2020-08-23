var fs = require('fs'),
    iconv = require('iconv-lite');

function convertFile (source) {
  fs.createReadStream(source + '.xml')
    .pipe(iconv.decodeStream('win1250'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream(source + '-utf8.xml'));
}

convertFile ('../zdroje/current/serk');
convertFile ('../zdroje/current/SE2020ciselnik20200819/cvs');
convertFile ('../zdroje/current/KZ2020reg20200818/kzrk');
convertFile ('../zdroje/current/KZ2020reg20200818/kzrkl_s');
convertFile ('../zdroje/current/KZ2020reg20200818/kzrkl');
