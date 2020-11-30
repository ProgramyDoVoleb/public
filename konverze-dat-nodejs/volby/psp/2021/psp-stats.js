var fs = require('fs');
var $ = require('cheerio');

var target = 'data/volby/psp/2021/rejstrik/lide/data/';
var stats = 'zdroje/volby/psp/2021/sweep/stats/'
var sweepFile = 'zdroje/volby/psp/2021/sweep/psp-sweep.json';
var sweep = JSON.parse(fs.readFileSync(sweepFile));

sweep.forEach(member => {
  var data = JSON.parse(fs.readFileSync(target + member.hash + '.json'));
  var html = fs.readFileSync(stats + member.psp.id + '.html').toString();

  var rows = $('table tr', html);

  if (rows.length > 0) {
    try {
      data.psp.stats.voted.total = Number(rows[0].children[1].children[0].children[0].children[0].data);
      data.psp.stats.voted.yes = Number(rows[2].children[1].children[0].children[0].children[0].data);
      data.psp.stats.voted.no = Number(rows[3].children[1].children[0].children[0].children[0].data);
      data.psp.stats.voted.none = Number(rows[4].children[1].children[0].children[0].children[0].data);
      data.psp.stats.excused = Number(rows[6].children[1].children[0].children[0].children[0].data);
      data.psp.stats.missing = Number(rows[7].children[1].children[0].children[0].children[0].data);
    } catch (e) {
      console.log('Error found in ' + member.psp.id);

        data.psp.stats.voted.total = Number(rows[0].children[1].children[0].children[0].children[0].data);
        data.psp.stats.voted.yes = Number(rows[2].children[1].children[0].children[0].children[0].data);
        data.psp.stats.voted.no = Number(rows[3].children[1].children[0].children[0].children[0].data);
        data.psp.stats.voted.none = Number(rows[4].children[1].children[0].children[0].children[0].data);
        data.psp.stats.excused = 0;
        data.psp.stats.missing = Number(rows[6].children[1].children[0].children[0].children[0].data);
    }
  }

  data.psp.stats.lastUpdate = new Date().getTime();

  if (member.psp.id === 6150) {
    console.log(rows[0].children[1].children[0].children[0].children[0].data)
    console.log(member.psp.stats);
  }

  // return;

  fs.writeFileSync('data/volby/psp/2021/rejstrik/lide/data/' + member.hash + '.json', JSON.stringify(data, null, 2));
});
