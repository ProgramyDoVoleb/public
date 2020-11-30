var fs = require('fs');

var sweepFile = 'zdroje/volby/psp/2021/sweep/psp-sweep.json';

var sweep = JSON.parse(fs.readFileSync(sweepFile));

var json = {
  created: new Date().toISOString().split('T')[0],
  list: []
}

sweep.forEach(m => {
  json.list.push('lide/' + m.hash);
});

fs.writeFileSync('data/volby/psp/2021/rejstrik/poslanci.json', JSON.stringify(json, null, 2));
