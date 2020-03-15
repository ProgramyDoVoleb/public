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

function scrape (url, target, deeper, date, xid) {

  var options = {
    uri: base + url
  }

  if (linksToFetch.indexOf(options.url) === -1) {
    linksToFetch.push(options.uri);
    console.log(options.uri);
  } else {
    return;
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

              var keys = type[1].split('&');

              if (keys.length === 2) {
                // https://volby.cz/pls/kv2006/kv12?xjazyk=CZ&xid=19
                if (type[0] === 'kv12') {
                  setTimeout(() => {
                    scrape(date + '/' + l, date + '-' + xid + '/helpers/' + type[0] + '-' + xid, true, date, xid);
                  }, 300 * index)
                }
              }

              if (keys.length === 3) {
                // https://volby.cz/pls/kv2006/kv111?xjazyk=CZ&xid=19&xnumnuts=2108&xstat=0
                if (type[0] === 'kv111') {
                  var nuts = keys[2].split('=');

                  setTimeout(() => {
                    scrape(date + '/' + l, date + '-' + xid + '/helpers/' + type[0] + '-' + xid + '-' + nuts[1], false, date, xid);
                  }, 100 * index)
                }
              }

              if (keys.length === 4) {
                // https://volby.cz/pls/kv2006/kv111?xjazyk=CZ&xid=19&xnumnuts=2108&xstat=0
                if (type[0] === 'kv111') {
                  var nuts = keys[2].split('=');

                  setTimeout(() => {
                    scrape(date + '/' + l, date + '-' + xid + '/helpers/' + type[0] + '-' + xid + '-' + nuts[1], false, date, xid);
                  }, 100 * index)
                }
              }

              if (keys.length === 7) {
                // https://volby.cz/pls/kv2006/kv1111?xjazyk=CZ&xid=19&xdz=1&xnumnuts=2108&xobec=537306&xstat=0&xvyber=0
                if (type[0] === 'kv1111') {
                  var nuts = keys[3].split('=');
                  var town = keys[4].split('=');

                  if (linksToFetch.indexOf(base + date + '/' + l) === -1) {
                    linksToFetch.push(base + date + '/' + l);
                    console.log(base + date + '/' + l);
                  }

                  return;

                  setTimeout(() => {
                    scrape(date + '/' + l, date + '-' + xid + '/vysledky/' + type[0] + '-' + xid + '-' + town[1], false, date, xid);
                  }, 50 * index)
                }
              }

              if (keys.length === 8) {
                // https://volby.cz/pls/kv2006/kv21111?xjazyk=CZ&xid=19&xv=23&xdz=1&xnumnuts=2108&xobec=537306&xstrana=0&xodkaz=1
                if (type[0] === 'kv21111') {
                  var nuts = keys[4].split('=');
                  var town = keys[5].split('=');

                  if (linksToFetch.indexOf(base + date + '/' + l) === -1) {
                    linksToFetch.push(base + date + '/' + l);
                    console.log(base + date + '/' + l);
                  }

                  return;

                  setTimeout(() => {
                    scrape(date + '/' + l, date + '-' + xid + '/vysledky/' + type[0] + '-' + xid + '-' + town[1] + '-mandaty');
                  }, 100 * index)
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

/**

list.forEach((d, i) => {

  var id = Object.keys(d)[0];

  setTimeout(() => {
    for (var xid = 2; xid < d[id] + 1; xid++) {

      var path = id + '-' + xid;

      if (!fs.existsSync(dir + path)) {
        fs.mkdirSync(dir + path);
      }

      if (!fs.existsSync(dir + path + '/vysledky')) {
        fs.mkdirSync(dir + path + '/vysledky');
      }

      if (!fs.existsSync(dir + path + '/helpers')) {
        fs.mkdirSync(dir + path + '/helpers');
      }

      scrape(id + '/kv?xjazyk=CZ&xid=' + xid, path + '/prehled', true, id, xid);
    }
  }, 30000 * i)

});

*/

// https://volby.cz/pls/kv2018/kv12?xjazyk=CZ&xid=10
scrape('kv2018/kv12?xjazyk=CZ&xid=10', 'kv2018/10-prehled', true, 'kv2018', 10);

setTimeout(() => {

  console.log("SORTING");

  linksToFetch.sort((a, b) => a.localeCompare(b, 'cs'));

  fs.writeFileSync(dir + 'linksToFetch.json', JSON.stringify(linksToFetch));
}, 4000)
