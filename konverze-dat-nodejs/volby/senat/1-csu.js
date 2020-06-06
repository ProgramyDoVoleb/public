var fs = require('fs');
var request = require('request');
const rp = require('request-promise');
var iconv = require('iconv-lite');
var unzipper = require('unzipper');
const $ = require('cheerio');

var list = [/** 19961116, 19981114, 19990828, 20001112, 20021025, 20031107, 20031031, 20041105, 20041008, 20061020, 20070413, 20070427, 20081017, 20101015, 20110318, 20121012, 20140110, 20140919, 20141010, 20161007, 20170127, 20180105, 20180518, 20181005, 20190405 */20200605];

const base = 'https://volby.cz/pls/senat/';
const dir = '../zdroje/volby/senat/';

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

  console.log(options.uri);

  rp(options)
    .then(function(html) {

      writeFile(url, target)

      // return;

      if (deeper) {
        var links = $('a', html);

        Object.keys(links).forEach((link, index) => {
          if (links[link].attribs) {
            var l = links[link].attribs.href;

            var type = l.split('?');

            if (type.length > 1) {
              var keys = type[1].split('&');

              if (keys.length === 3) {
                // https://volby.cz/pls/senat/se2111?xjazyk=CZ&xdatum=19961116&xobvod=1
                if (type[0] === 'se2111') {
                  var value = keys[2].split('=');

                  setTimeout(() => {
                    scrape(l, date + '/obvod/' + value[1])
                  }, 20 * index)
                }

                if (type[0] === 'se21') {
                  var value = keys[2].split('=');

                  setTimeout(() => {
                    scrape(l, date + '/prehled/' + value[1], true, date);
                  }, 100 * index)
                }
              }

              if (keys.length === 4) {
                if (type[0] === 'se2111') {
                  var value = keys[2].split('=');
                  var town = keys[3].split('=');

                  setTimeout(() => {
                    scrape(l, date + '/obce/' + value[1] + '-' + town[1])
                  }, 50 * index)
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

list.forEach((d, i) => {
  // https://volby.cz/pls/senat/se2?xjazyk=CZ&xdatum=19961116
  setTimeout(() => {
    scrape('se2?xjazyk=CZ&xdatum=' + d, d + '/prehled', true, d);
    scrape('se1111?xjazyk=CZ&xdatum=' + d + '&xv=1&xt=1', d + '/kandidati', false, d);
  }, 3000 * i)

});
