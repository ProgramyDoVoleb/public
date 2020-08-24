var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var partiesFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/current/utf/kzrk-utf8.xml', function(err, content) {
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

  var json = [[],[],[],[],[],[],[],[],[],[],[],[],[]];

  values[0].KZ_REGKAND.KZ_REGKAND_ROW.forEach((item, index) => {
    var k = Number(item.KRZAST[0]) - 1;
    var no = Number(item.KSTRANA[0]);

    var list = [];
    var f = json[k].find(x => x.no === no)

    if (f) {
      list = f.list;
    } else {
      var o = {
        no,
        region: k + 1,
        list: []
      }

      list = o.list;
      json[k].push(o);
    }

    var person = {
      nameFull: ['', item.JMENO[0], item.PRIJMENI[0], ''],
      age: Number(item.VEK[0]),
      work: item.POVOLANI[0],
      home: item.BYDLISTEN[0],
      homeMeta: {
        num: Number(item.BYDLISTEK[0]),
        gps: []
      },
      reg: Number(item.PSTRANA[0]),
      nominee: Number(item.NSTRANA[0]),
      sex: 1,
      links: []
    }

    if (person.nameFull[2].charAt(person.nameFull[2].length - 1) === 'á') person.sex = 2;

    if (item.TITULPRED) person.nameFull[0] = item.TITULPRED[0];
    if (item.TITULZA) person.nameFull[3] = item.TITULZA[0];

    list.push(person);
  });

  fs.writeFileSync('../zdroje/current/utf/kandidati.json', JSON.stringify(json, null, 2));
});

return;
