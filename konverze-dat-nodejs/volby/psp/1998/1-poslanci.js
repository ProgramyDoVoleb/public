const rp = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');
const iconv = require('iconv-lite');

const base = 'https://volby.cz/pls/ps1998/';

function writeFile (content, file) {
  var cnt = iconv.decode(content, 'latin1');
  var cnt2 = iconv.decode(cnt, 'latin2');
  var str = iconv.encode(cnt2, 'utf8');

  console.log(file);

  fs.writeFile('../../zdroje/volby/psp/1998/' + file + '.html', str, function(err) {
      if(err) {
          return console.log(err);
      }
  });
}

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

            // https://volby.cz/pls/ps1996/u391?xvstrana=17&xkraj=31&xvyb=0&xtr=1

            var type = l.split('?');
            var keys = type[1].split('&');
            var value = keys[1].split('=');
            var value2 = keys[0].split('=');

            setTimeout(() => {
              scrape(l, 'mandaty/' + value2[1] + '-' + value[1])
            }, 150 * index)



            if (type.length > 1) {
              var keys = type[1].split('&');

              if (keys.length > 1) {
                if (type[0] === 'u5312') {
                  var value = keys[1].split('=');
                  var value2 = keys[0].split('=');

                  setTimeout(() => {
                    scrape(l, 'okresy/' + value2[1] + '-' + value[1])
                  }, 150 * index)
                }
                if (type[0] === 'u5311') {
                  var value = keys[1].split('=');
                  var value2 = keys[0].split('=');

                  setTimeout(() => {
                    scrape(l, 'obce/' + value2[1] + '-' + value[1], true)
                  }, 15000 * index * Number(value2) - 30)
                }
                // https://volby.cz/pls/ps1996/u53112?xkraj=32&xokres=1&xobec=529303
                if (type[0] === 'u53112') {

                  var value = keys[1].split('=');
                  var value2 = keys[0].split('=');
                  var value3 = keys[2].split('=');

                  setTimeout(() => {
                    scrape(l, 'obce/' + value2[1] + '-' + value[1] + '-' + value3[1])
                  }, 350 * index)
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

scrape('u39?xvyb=0&xtr=1', 'seznam', true);
