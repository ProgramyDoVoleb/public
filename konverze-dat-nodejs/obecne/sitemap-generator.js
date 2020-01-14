// <url><loc>https://www.polist.cz/</loc><lastmod>2020-01-01</lastmod><changefreq>weekly</changefreq></url>

var fs = require('fs');

function writeFile (data, to) {
  fs.writeFile(to, data, function(err) {

      if(err) {
          return console.log(err);
      }
  });
}

function betterURL (url) {
  var newURL = url;

  newURL = newURL.toLowerCase();
  newURL = newURL.split(' ').join('-');
  newURL = newURL.split('.').join('');
  newURL = newURL.split('(').join('');
  newURL = newURL.split(')').join('');
  newURL = newURL.split('á').join('a');
  newURL = newURL.split('č').join('c');
  newURL = newURL.split('ď').join('d');
  newURL = newURL.split('é').join('e');
  newURL = newURL.split('ě').join('e');
  newURL = newURL.split('í').join('i');
  newURL = newURL.split('ľ').join('l');
  newURL = newURL.split('ň').join('n');
  newURL = newURL.split('ó').join('o');
  newURL = newURL.split('ř').join('r');
  newURL = newURL.split('š').join('s');
  newURL = newURL.split('ť').join('t');
  newURL = newURL.split('ú').join('u');
  newURL = newURL.split('ů').join('u');
  newURL = newURL.split('ý').join('y');
  newURL = newURL.split('ž').join('z');

  return newURL;
}

var obce = JSON.parse(fs.readFileSync('../data/obecne/obce.json')).list;
var strany = JSON.parse(fs.readFileSync('../data/obecne/strany.json')).list;
var volby = JSON.parse(fs.readFileSync('../data/obecne/seznam-voleb.json')).list;

var sitemap = [];

obce.forEach(obec => {
  sitemap.push('<url><loc>https://www.polist.cz/obec/' + obec.id + '-' + betterURL(obec.name) + '</loc><lastmod>2020-01-13</lastmod><changefreq>weekly</changefreq></url>')
});

strany.forEach(strana => {
  sitemap.push('<url><loc>https://www.polist.cz/rejstrik/' + strana.reg + '-' + strana.hash + '</loc><lastmod>2020-01-13</lastmod><changefreq>weekly</changefreq></url>')
});

volby.forEach(type => {
  sitemap.push('<url><loc>https://www.polist.cz/vysledky/' + type.hash + '</loc><lastmod>2020-01-13</lastmod><changefreq>monthly</changefreq></url>');

  type.list.forEach(el => {
    sitemap.push('<url><loc>https://www.polist.cz/vysledky/' + type.hash + '/' + el.id + '</loc><lastmod>2020-01-13</lastmod><changefreq>monthly</changefreq></url>');
  })
});

writeFile(sitemap.join("\n"), '../data/obecne/sitemap-segment.xml');
