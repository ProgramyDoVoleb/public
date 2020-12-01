var fs = require('fs');

var target = 'data/volby/psp/2021/rejstrik/lide/data/';
var sweepFile = 'zdroje/volby/psp/2021/sweep/poslanci.json';
var sweep = JSON.parse(fs.readFileSync(sweepFile));

sweep.forEach(member => {
  var data = JSON.parse(fs.readFileSync(target + member.hash + '.json'));

  member.photo.thumb = member.photo.source.split('fotky').join('nahledy');
  data.photo.thumb = member.photo.thumb;

  fs.writeFileSync('data/volby/psp/2021/rejstrik/lide/data/' + member.hash + '.json', JSON.stringify(data, null, 2));
});

fs.writeFileSync(sweepFile, JSON.stringify(sweep, null, 2));
