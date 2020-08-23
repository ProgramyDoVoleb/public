var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

var partiesFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/current/utf/kzrkl_s-utf8.xml', function(err, content) {
    parser.parseString(content, function (err, json) {
      resolve(json);
    });
  });
});

function betterURL (url) {
  var newURL = url;

  var repl = [[' ', '-'],['+', '-'],['.', '-'],[',', '-'],['–', '-'],['?', ''],['!', ''],['(', ''],[')', ''],['á', 'a'],['č', 'c'],['ď', 'd'],['é', 'e'],['ě', 'e'],['í', 'i'],['ľ', 'l'],['ň', 'n'],['ó', 'o'],['ř', 'r'],['š', 's'],['ť', 't'],['ú', 'u'],['ů', 'u'],['ý', 'y'],['ž', 'z']];

  newURL = newURL.toLowerCase();

  repl.forEach(r => newURL = newURL.split(r[0]).join(r[1]));

  return newURL;
}

Promise.all([partiesFile]).then(function (values) {

  values[0].KZ_RKL_SOUHRN.KZ_RKL_SOUHRN_ROW.forEach((item, index) => {

    var reg = Number(item.VSTRANA[0]);
    var short = item.ZKRATKAK8 ? item.ZKRATKAK8[0] : item.ZKRATKAK30[0];
    var hash = betterURL(short);

    // console.log(index, reg);

    var o = {reg};
    var lookup = true;

    try {
      o = JSON.parse(fs.readFileSync("../data/volby/kv/2020/strany/" + reg + "-" + hash + ".json"))
    } catch (e) {
      o = {
        reg: reg
      };
      lookup = false;
    }

    o.name = item.NAZEVCELK[0];
    o.hash = hash;
    o.short = short;
    o.no = Number(item.KSTRANA[0])

    if (item.SLOZENI[0].split(',').length > 1) {
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

    if (!o.active) {
      o.active = [];
      item.STAVREG[0].split('').forEach((x, i) => {
        if (x === '0') o.active.push(i);
      });
    }

    // if (!lookup) {
      fs.writeFileSync('../data/volby/kv/2020/strany/' + o.reg + '-' + o.hash + '.json', JSON.stringify(o, null, 2));
    // }
  });
});

return;
