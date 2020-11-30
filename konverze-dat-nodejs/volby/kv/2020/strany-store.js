var fs = require('fs');

function betterURL (url) {
  var newURL = url;

  var repl = [[' ', '-'],['.', '-'],[',', '-'],['–', '-'],['?', ''],['!', ''],['(', ''],[')', ''],['á', 'a'],['č', 'c'],['ď', 'd'],['é', 'e'],['ě', 'e'],['í', 'i'],['ľ', 'l'],['ň', 'n'],['ó', 'o'],['ř', 'r'],['š', 's'],['ť', 't'],['ú', 'u'],['ů', 'u'],['ý', 'y'],['ž', 'z']];

  newURL = newURL.toLowerCase();

  repl.forEach(r => newURL = newURL.split(r[0]).join(r[1]));

  return newURL;
}

var partiesInElection = JSON.parse(fs.readFileSync('../data/volby/kv/2020/strany.json'));

var filesOfParties = fs.readdirSync('../data/obecne/strany/data/');

partiesInElection.list.forEach(party => {
  if (!party.reg) return;

  var file = filesOfParties.find(x => Number(x.split('-')[0]) === party.reg);

  var filename = '../data/obecne/strany/data/' + file;

  if (fs.existsSync(filename)) {
    var data = JSON.parse(fs.readFileSync(filename));

    if (data) {
      data.name = party.name;
      data.short = party.short;
      data.hash = party.hash;
      if (party.logo) data.logo = party.logo;
      if (party.color) data.color = party.color;
      if (party.links) data.links = party.links;

      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    }
  } else {
    console.log(party.reg, party.name, filename);
  }
});
