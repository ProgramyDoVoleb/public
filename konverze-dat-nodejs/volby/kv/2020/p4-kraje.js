var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

var regionIDList = ['pha', 'stk', 'jck', 'plk', 'kvk', 'ulk', 'lbk', 'khk', 'pak', 'vys', 'jmk', 'olk', 'zlk', 'msk']

var partiesFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/current/utf/kzrkl-utf8.xml', function(err, content) {
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

  values[0].KZ_RKL.KZ_RKL_ROW.forEach((item, index) => {

    var reg = Number(item.VSTRANA[0]);
    var short = item.ZKRATKAK8 ? item.ZKRATKAK8[0] : item.ZKRATKAK30[0];
    var name = item.NAZEVCELK[0];
    var hash = betterURL(name);
    var region = regionIDList[Number(item.KRZAST[0])];

    // console.log(index, reg);

    var o = {reg};
    var lookup = "../data/volby/kv/2020/data/" + region + '/' + reg + ".json";

    try {
      o = JSON.parse(fs.readFileSync(lookup))
    } catch (e) {
      o = {
        reg: reg
      };
    }

    o.name = name;
    o.hash = hash;
    o.short = short;
    o.no = Number(item.KSTRANA[0])

    if (item.SLOZENI[0].split(',').length > 1) {
      o.coalition = item.SLOZENI[0].split(",").map(it => Number(it));
    }

    // if (!lookup) {
      fs.writeFileSync(lookup, JSON.stringify(o, null, 2));
    // }
  });
});

return;
