var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

var partiesFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/current/utf/serk-utf8.xml', function(err, content) {
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

var json = JSON.parse(fs.readFileSync('../data/volby/senat/20201002/kandidati.json'));

Promise.all([partiesFile]).then(function (values) {

  values[0].SE_REGKAND.SE_REGKAND_ROW.forEach((item, index) => {
    var o = json.list.find(x => x.name[1] === item.JMENO[0] && x.name[2] === item.PRIJMENI[0])

    o.no = Number(item.CKAND[0]);
    o.party = {
      reg: Number(item.VSTRANA[0]),
      name: item.NAZEV_VS[0]
    };
    o.age = Number(item.VEK[0]);
    o.work = o.work || (item.POVOLANI[0]);
    o.home = (item.BYDLISTEN[0]);
    o.homeID = Number(item.BYDLISTEK[0]);
    o.member = Number(item.PSTRANA[0]);
    o.nominee = Number(item.NSTRANA[0]);

    o.sex = 1;

    if (o.name[2].charAt(o.name[2].length - 1) === 'á') o.sex = 2;

    if (item.TITULPRED) o.name[0] = item.TITULPRED[0];
    if (item.TITULZA) o.name[3] = item.TITULZA[0];
  });

  fs.writeFileSync('../data/volby/senat/20201002/kandidati.json', JSON.stringify(json, null, 2));
});

return;
