const rp = require('request-promise');
const request = require('request');
const $ = require('cheerio');
const fs = require('fs');
const iconv = require('iconv-lite');

const base = 'https://volby.cz/pls/ps2002/';
const dir = '../../../zdroje/volby/psp/2002/';

function writeFile (source, file) {
  request.get(base + source)
    .pipe(iconv.decodeStream('iso-8859-2'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream(dir + file + '.html'));
}

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
                if (type[0] === 'ps43') {
                  var value = keys[2].split('=');
                  var value2 = keys[1].split('=');

                  setTimeout(() => {
                    scrape(l, 'okresy/' + value2[1] + '-' + value[1])
                  }, 150 * index)
                }
                if (type[0] === 'ps45') {
                  var value = keys[2].split('=');
                  var value2 = keys[1].split('=');

                  setTimeout(() => {
                    scrape(l, 'obce/' + value2[1] + '-' + value[1], true)
                  }, 15000 * index * Number(value2) - 30)
                }
                // https://volby.cz/pls/ps1996/u53112?xkraj=32&xokres=1&xobec=529303
                if (type[0] === 'ps451') {

                  var value = keys[2].split('=');
                  var value2 = keys[1].split('=');
                  var value3 = keys[3].split('=');

                  setTimeout(() => {
                    scrape(l, 'obce/' + value2[1] + '-' + value[1] + '-' + value3[1])
                  }, 350 * index)
                }

                if (type[0] === 'ps42') {
                  var value = keys[1].split('=');
                  scrape(l, 'kraje/' + value[1])
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

scrape('ps4', 'main', true);
