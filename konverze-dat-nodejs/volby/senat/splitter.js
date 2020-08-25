var fs = require('fs');

function betterURL (url) {
  var newURL = url;

  var repl = [[' ', '-'],['+', '-'],['.', '-'],[',', '-'],['–', '-'],['?', ''],['!', ''],['(', ''],[')', ''],['á', 'a'],['č', 'c'],['ď', 'd'],['é', 'e'],['ě', 'e'],['í', 'i'],['ľ', 'l'],['ň', 'n'],['ó', 'o'],['ř', 'r'],['š', 's'],['ť', 't'],['ú', 'u'],['ů', 'u'],['ý', 'y'],['ž', 'z'],['ö', 'o'],['ü', 'u']];

  newURL = newURL.toLowerCase();

  repl.forEach(r => newURL = newURL.split(r[0]).join(r[1]));

  return newURL;
}

var json = JSON.parse(fs.readFileSync('./data/volby/senat/20201002/kandidati-3.json'));

var list = [];

json.list.forEach(cand => {
  var hash = betterURL(cand.name[1] + ' ' + cand.name[2]);

  fs.writeFileSync('./data/volby/senat/20201002/data/' + hash + '.json', JSON.stringify(cand, null, 2));

  list.push(hash);
});

fs.writeFileSync('./data/volby/senat/20201002/data.json', JSON.stringify(list, null, 2));
