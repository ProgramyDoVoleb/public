var fs = require('fs');

var target = 'data/volby/psp/2021/rejstrik/lide/data/';
var sweepFile = 'zdroje/volby/psp/2021/sweep/psp-sweep.json';
var sweep = JSON.parse(fs.readFileSync(sweepFile));

var json = [];

sweep.forEach(member => {
  var data = JSON.parse(fs.readFileSync(target + member.hash + '.json'));

  json.push(data);
});

fs.writeFileSync(sweepFile, JSON.stringify(json, null, 2));
