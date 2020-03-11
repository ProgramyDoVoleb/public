var fs = require('fs');
var request = require('request');
const rp = require('request-promise');
var iconv = require('iconv-lite');
var unzipper = require('unzipper');
const $ = require('cheerio');

var list = [{'kv2018': 9}, {'kv2014': 17}, {'kv2010': 20}, {'kv2006': 21}, {'kv2002': 15}, {'kv1998': 2}];

const base = 'https://volby.cz/pls/';
const dir = '../zdroje/volby/kom/';

var linksToFetch = [];

function writeFile (source, file) {
  request.get(base + source)
    .pipe(iconv.decodeStream('iso-8859-2'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream(dir + file + '.html'));
}

function scrape (url, target, deeper, date) {

  var options = {
    uri: base + url
  }

  rp(options)
    .then(function(html) {

      // writeFile(url, target)

      // return;

      if (deeper) {
        var links = $('a', html);

        Object.keys(links).forEach((link, index) => {
          if (links[link].attribs) {
            var l = links[link].attribs.href;

            if (!l) return;

            var type = l.split('?');

            if (type.length > 1) {

              if (type[0] === 'kv1111') {
                if (linksToFetch.indexOf(base + date + '/' + l) === -1) {
                  linksToFetch.push(base + date + '/' + l);
                  console.log(base + date + '/' + l);
                }

                // scrape(date + '/' + l, date + '/vysledky/', false, date);
              }

              if (type[0] === 'kv21111') {
                if (linksToFetch.indexOf(base + date + '/' + l) === -1) {
                  linksToFetch.push(base + date + '/' + l);
                  console.log(base + date + '/' + l);
                }
              }
            }
          }
        })
      }
    })
    .catch(function(err){
      console.log(err);
      //handle error
    });
}



var list = JSON.parse(fs.readFileSync(dir + 'linksToFetch.json'));

list.forEach((d, i) => {

  setTimeout(() => {
    var link = d.split(base)[1];
    var file = link.split('/').join('-------');
        file = file.split('?').join('-----');
        file = file.split('&').join('---');
        file = file.split('=').join('-');
    var date = file.split('-------')[0];

    console.log(date, link, file);

    scrape(link, file, true, date);
  }, i * 100);

});

setTimeout(() => {
  fs.writeFileSync(dir + 'linksToFetch-2.json', JSON.stringify(linksToFetch));
}, (list.length + 2) * 100);
