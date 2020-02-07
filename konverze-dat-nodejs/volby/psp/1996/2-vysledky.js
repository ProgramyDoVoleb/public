const rp = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');
const iconv = require('iconv-lite');

const base = 'https://volby.cz/pls/ps1996/';
const dir = '../../zdroje/volby/psp/1996/';

function writeFile (content, file) {
  var cnt = iconv.decode(content, 'latin1');
  var cnt2 = iconv.decode(cnt, 'latin2');
  var str = iconv.encode(cnt2, 'utf8');

  console.log(file);

  fs.writeFile(dir + file + '.html', str, function(err) {
      if(err) {
          return console.log(err);
      }
  });
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
    uri: base + url,
    encoding: 'latin1'
  }

  console.log(options.uri);

  rp(options)
    .then(function(html) {

      writeFile(html, target)

      if (deeper) {
        var links = $('a', html);

        Object.keys(links).forEach((link, index) => {
          if (links[link].attribs) {
            var l = links[link].attribs.href;

            var type = l.split('?');

            if (type.length > 1) {
              var keys = type[1].split('&');

              if (keys.length > 1) {
                if (type[0] === 'u5312') {
                  var value = keys[1].split('=');
                  var value2 = keys[0].split('=');

                  setTimeout(() => {
                    scrape(l, 'okresy/' + value2[1] + '-' + value[1])
                  }, 30 * index)
                }
                if (type[0] === 'u5311') {
                  var value = keys[1].split('=');
                  var value2 = keys[0].split('=');

                  setTimeout(() => {
                    scrape(l, 'hierarchie/' + value2[1] + '-' + value[1], true)
                  }, 10 * index)
                }
                // https://volby.cz/pls/ps1996/u53112?xkraj=32&xokres=1&xobec=529303
                if (type[0] === 'u53112') {

                  var value = keys[1].split('=');
                  var value2 = keys[0].split('=');
                  var value3 = keys[2].split('=');

                  towns.push({
                    link: l,
                    target: 'obce/' + value2[1] + '-' + value[1] + '-' + value3[1]
                  });
                }
              } else {
                var value = keys[0].split('=');
                scrape(l, 'kraje/' + value[1])
              }
            } else {
              scrape(l, 'vysledky')
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

scrape('u53', 'hierarchie/republika', true);

setTimeout(() => writeTowns(), 15000);
