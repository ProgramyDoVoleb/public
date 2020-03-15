var fs = require('fs');
var request = require('request');
const rp = require('request-promise');
var iconv = require('iconv-lite');
var unzipper = require('unzipper');
const $ = require('cheerio');

const base = 'https://volby.cz/pls/';
const dir = '../zdroje/volby/kom/';

var linksToFetch = [];

function writeFile (source, file) {
  request.get(base + source)
    .pipe(iconv.decodeStream('iso-8859-2'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream(dir + file + '.html'));
}

var list = JSON.parse(fs.readFileSync(dir + 'linksToFetch-3.json'));

list.forEach((d, i) => {

  // if (i > 10) return;

  setTimeout(() => {
    var link = d;
    var parts = link.split('?');
    var ids = parts[0].split('/');
    var params = parts[1].split('&');
    var obj = {};

    params.forEach(p => {
      var item = p.split('=');

      obj[item[0]] = item[1];
    });

    var date = ids[0];
    var file = obj.xid + '-' + obj.xobec + '-' + (ids[1] === 'kv1111' ? 'vysledky' : 'mandaty');

    linksToFetch.push(date + '/' + obj.xid + '-' + obj.xobec);

    if (!fs.existsSync(dir + date)) {
      fs.mkdirSync(dir + date);
    }

    writeFile(link, date + '/' + file);

    console.log(i, 'of', list.length);
  }, i * 30);

});

setTimeout(() => {
  fs.writeFileSync(dir + 'linksToFetch-4.json', JSON.stringify(linksToFetch));
}, (list.length + 2) * 30);
