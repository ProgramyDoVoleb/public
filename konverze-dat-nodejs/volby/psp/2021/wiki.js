var fs = require('fs');

var target = 'data/volby/psp/2021/rejstrik/lide/data/';
var sweepFile = 'zdroje/volby/psp/2021/sweep/psp-sweep.json';
var sweep = JSON.parse(fs.readFileSync(sweepFile));
var wiki = JSON.parse(fs.readFileSync('zdroje/volby/psp/2021/sweep/wiki.json'));

sweep.forEach(member => {
  var data = JSON.parse(fs.readFileSync(target + member.hash + '.json'));

  var w = wiki.find(x => x.name === data.name);

  if (w) {
    data.links.push(w.link);
  } else {
    console.log(data.name);
  }

  fs.writeFileSync('data/volby/psp/2021/rejstrik/lide/data/' + member.hash + '.json', JSON.stringify(data, null, 2));
});
