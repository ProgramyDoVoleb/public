var fs = require('fs');
var $ = require('cheerio');

var target = 'data/volby/psp/2021/rejstrik/lide/data/';
var stats = 'zdroje/volby/psp/2021/sweep/detail/'
var sweepFile = 'zdroje/volby/psp/2021/sweep/psp-sweep.json';
var sweep = JSON.parse(fs.readFileSync(sweepFile));

var regions = ['Hlavní město Praha', 'Středočeský', 'Jihočeský', 'Plzeňský', 'Karlovarský', 'Ústecký', 'Liberecký', 'Královéhradecký', 'Pardubický', 'Vysočina', 'Jihomoravský', 'Olomoucký', 'Zlínský', 'Moravskoslezský']

var parties = [
  {short: 'KDU-ČSL', reg: 1},
  {short: 'ČSSD', reg: 7},
  {short: 'KSČM', reg: 47},
  {short: 'ODS', reg: 53},
  {short: 'STAN', reg: 166},
  {short: 'Piráti', reg: 720},
  {short: 'TOP09', reg: 721},
  {short: 'ANO2011', reg: 768},
  {short: 'SPD', reg: 1114}
]

sweep.forEach(member => {
  var data = JSON.parse(fs.readFileSync(target + member.hash + '.json'));
  var html = fs.readFileSync(stats + member.psp.id + '.html').toString();

  // email

  var links = $('.mail a', html);

  if (links.length > 0) {
    // data.links.push(links[0].children[0].data);
  }

  // narozeni

  var born = $('.photo-column strong', html);

  if (born.length > 0) {
    var date = born[0].children[0].data.split(' ')[1].split('. ');
    data.born = date[2] + '-' + date[1] + '-' + date[0];
  }

  // volebni kraj

  var meta = $('.photo-column p', html);

  if (meta[0].children[2] && meta[0].children[4]) {
    try {
      data.psp.election = {};
      data.psp.election.region = regions.indexOf(meta[0].children[2].data.split('kraj: ')[1].trim());
      data.psp.election.nominee = meta[0].children[4].data.split('kandidátce: ')[1].trim();
      data.psp.election.party = data.psp.election.nominee;
    } catch (e) {
      data.psp.election = {};
      data.psp.election.region = 12;
      data.psp.election.nominee = 'ANO2011';
      data.psp.election.party = data.psp.election.nominee;
    }

    try {
      var x = parties.find(x => x.short === data.psp.election.nominee);

      if (x) {
        data.psp.election.nominee = x.reg;
        data.psp.election.party = x.reg;
      } else {
        console.log(data.psp.election.nominee);
      }
    } catch (e) {
      console.log(data);
    }

    data.psp.stats.updated = new Date(data.psp.stats.lastUpdate).toISOString().split('T')[0];
    data.psp.stats.lastUpdate = undefined;
  }

  if (data.psp.id === 6150) {
    console.log(data);
  }

  // return;

  fs.writeFileSync('data/volby/psp/2021/rejstrik/lide/data/' + member.hash + '.json', JSON.stringify(data, null, 2));
});
