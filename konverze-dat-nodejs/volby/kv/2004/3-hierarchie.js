const rp = require('request-promise');
const request = require('request');
const $ = require('cheerio');
const fs = require('fs');
const iconv = require('iconv-lite');

const base = 'https://volby.cz/pls/kz2004/';
const dir = '../../zdroje/volby/kv/2004/';

function writeFile (source, file) {
  request.get(base + source)
    .pipe(iconv.decodeStream('iso-8859-2'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream(dir + file + '.html'));
}

function writeTowns () {
  fs.writeFile(dir + 'hierarchie/mesta.json', JSON.stringify(towns), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

var towns = [];

function scrape (url, target, deeper) {

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

              if (keys.length > 1) {
                if (type[0] === 'kz311' &&  keys[3] && keys[3].substring(0, 3) != 'xob') {
                  var value = keys[3].split('=');
                  var value2 = keys[2].split('=');

                  setTimeout(() => {
                    scrape(l, 'okresy/' + value2[1] + '-' + value[1])
                  }, 30 * index)
                }
                if (type[0] === 'kz32') {
                  var value = keys[3].split('=');
                  var value2 = keys[2].split('=');

                  setTimeout(() => {
                    scrape(l, 'hierarchie/' + value2[1] + '-' + value[1], true)
                  }, 10 * index)
                }
                // https://volby.cz/pls/ps1996/u53112?xkraj=32&xokres=1&xobec=529303
                if (type[0] === 'kz311' && keys[3] && keys[3].substring(0, 3) === 'xob') {

                  var value = keys[2].split('=');
                  var value2 = keys[1].split('=');
                  var value3 = keys[3].split('=');

                  towns.push({
                    link: l,
                    target: 'obce/' + value[1] + '-' + value3[1]
                  });
                }
              } else {
                scrape(l, 'vysledky')
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

scrape('kz3?xjazyk=CZ&xdatum=20041105', 'hierarchie/republika', true);

setTimeout(() => writeTowns(), 15000);
