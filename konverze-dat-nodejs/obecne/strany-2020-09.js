var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

var partiesFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/current/utf/cvs-utf8.xml', function(err, content) {
    parser.parseString(content, function (err, json) {
      resolve(json);
    });
  });
});

function betterURL (url) {
  var newURL = url;

  var repl = [[' ', '-'],['.', '-'],[',', '-'],['–', '-'],['?', ''],['!', ''],['(', ''],[')', ''],['á', 'a'],['č', 'c'],['ď', 'd'],['é', 'e'],['ě', 'e'],['í', 'i'],['ľ', 'l'],['ň', 'n'],['ó', 'o'],['ř', 'r'],['š', 's'],['ť', 't'],['ú', 'u'],['ů', 'u'],['ý', 'y'],['ž', 'z']];

  newURL = newURL.toLowerCase();

  repl.forEach(r => newURL = newURL.split(r[0]).join(r[1]));

  return newURL;
}

var json = JSON.parse(fs.readFileSync('../data/obecne/strany.json'));

Promise.all([partiesFile]).then(function (values) {

  json.created = new Date().getTime(),

  values[0].CVS.CVS_ROW.forEach(item => {

    var reg = Number(item.VSTRANA[0]);
    var o = {reg};

    var lookup = json.list.find(x => x.reg === reg);

    if (lookup) {
      o = lookup;
    } else {
      json.list.push(o);
    }

    var short = item.ZKRATKAV8 ? item.ZKRATKAV8[0] : item.ZKRATKAV30[0];
    var hash = betterURL(short);

    o.name = item.NAZEVCELK[0];
    o.hash = hash;
    o.short = short;

    if (item.TYPVS[0] === "K") {
      o.coalition = item.SLOZENI[0].split(",").map(it => Number(it));
    }

    if (!o.links) {
      o.links = {
        global: [],
        regional: []
      };
    }

    if (!o.color) {
      o.color = "#aaa";
    }

    if (!lookup) {
      fs.writeFileSync('../data/obecne/strany/data/' + o.reg + '-' + o.hash + '.json', JSON.stringify(o, null, 2));
    }
  });

  fs.writeFileSync('../data/obecne/strany.json', JSON.stringify(json, null, 2));
});

return;
