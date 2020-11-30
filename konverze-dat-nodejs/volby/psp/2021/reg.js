var fs = require('fs');

var target = 'data/volby/psp/2021/rejstrik/lide/data/';
var sweepFile = 'zdroje/volby/psp/2021/sweep/psp-sweep.json';
var sweep = JSON.parse(fs.readFileSync(sweepFile));

sweep.forEach(member => {
  var data = JSON.parse(fs.readFileSync(target + member.hash + '.json'));

  data.party = data.psp.election.party;

  fs.writeFileSync(target + member.hash + '.json', JSON.stringify(data, null, 2));
});
