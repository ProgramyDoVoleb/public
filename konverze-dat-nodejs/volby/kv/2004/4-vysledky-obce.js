const rp = require('request-promise');
const request = require('request');
const $ = require('cheerio');
const fs = require('fs');
const iconv = require('iconv-lite');

const base = 'https://volby.cz/pls/kz2004/';
const dir = '../../zdroje/volby/kv/2004/';

function writeFile (source, file, index) {
  console.log(index, file)

  try {
    request.get(base + source)
      .pipe(iconv.decodeStream('iso-8859-2'))
      .pipe(iconv.encodeStream('utf8'))
      .pipe(fs.createWriteStream(dir + file + '.html'));
  } catch (e) {
    console.log('ERR', e);
  }
}

var towns = JSON.parse(fs.readFileSync(dir + 'hierarchie/mesta.json'));

if (towns) {
  var index = 0;
  towns.forEach((town, i) => {

    if (fs.existsSync(dir + town.target + '.html')) {
      if (fs.statSync(dir + town.target + '.html')['size'] > 100) {
        return;
      }
    }

    index++;

    setTimeout(() => {
      writeFile(town.link, town.target, i)
    }, 50 * index);
  })
}
