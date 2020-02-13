var fs = require('fs');
var $ = require('cheerio');

var year = 2004;

var sourceDIR = '../zdroje/volby/kv/' + year + '/';
var targetDIR = '../data/volby/kv/' + year + '/';

var parties = JSON.parse(fs.readFileSync(targetDIR + 'strany.json'));

var results = [];

function parseName(str) {

  var name = ['', '', '', ''];

  var parts = str.split('  ');

  name[1] = parts[0].split(' ')[0].trim();
  name[2] = parts[0].split(' ')[1].trim();

  var titles = parts[1].split("CSc.");

  name[0] = titles[0].trim();

  if (titles.length > 1) {
    name[3] = 'CSc.';
  }

  return {name};
}

for (var i = 1; i < 14; i++) {

  var region = {
    id: i,
    votes: 0,
    voters: 0,
    pct: 0,
    parties: []
  }

  var htmlMandates = fs.readFileSync(sourceDIR + 'mandaty/' + i + '.html').toString();

  var mandates = [];

  var rowsMandates = $('tr', htmlMandates);

  Object.keys(rowsMandates).forEach((row, indexRow) => {

    if (!rowsMandates[row].children) return;

    var cells = $('td', rowsMandates[row]);

    if (cells.length === 10) {

      var person = {
        name: parseName(cells[3].children[0].data),
        id: Number(cells[0].children[0].data)
      }

      mandates.push(person);

    }

  });

  var htmlResults = fs.readFileSync(sourceDIR + 'kraje/' + i + '.html').toString();

  var tables = $('table', htmlResults);
  var stats = $('td', tables[0]);

  region.voters = Number(stats[4].children[0].data.split(" ").join(""));
  region.votes = Number(stats[5].children[0].data.split(" ").join(""));
  region.pct = Number(stats[6].children[0].data);

  var tableElements = [$('tr', tables[5]), $('tr', tables[6])];

  tableElements.forEach((rows, a) => {
    Object.keys(rows).forEach((row, b) => {

      var cells = $('td', rows[row]);

      if (cells.length > 0) {
        var party = parties.list.find(p => p.id === Number(cells[0].children[0].data));

        if (party) {
          var result = {
            id: party.id,
            reg: party.reg,
            votes: Number(cells[2].children[0].data.split(' ').join('')),
            ptc: Number(cells[3].children[0].data.split(' ').join('')),
            pct: Number(cells[3].children[0].data.split(' ').join('')),
            elected: mandates.filter(m => m.id === party.id)
          }

          if (!region.parties.find(p => p.id === result.id)) {
            region.parties.push(result);
          }
        }
      }
    })
  });

  results.push(region);
}

fs.writeFile(targetDIR + 'vysledky.json', JSON.stringify(results), () => {});
