var fs = require('fs');
var $ = require('cheerio');

var year = 1996;

var sourceDIR = '../zdroje/volby/psp/' + year + '/';
var targetDIR = '../data/volby/psp/' + year + '/';

var patriesInElection = JSON.parse(fs.readFileSync(targetDIR + 'strany.json'));

var electedFiles = fs.readdirSync(sourceDIR + 'mandaty/');
var electedByParty = {};

function parseName(str) {
  var name = ['', '', '', ''];

  str = str.split(', CSc.').join(',CSc.');
  str = str.split(', DrSc.').join(',DrSc.');

  var parts = str.split(' ');

  name[2] = parts[0].split(',')[0];
  name[3] = parts[0].split(',').length > 1 ? parts[0].split(',')[1] : '';

  if (parts.length === 2 || (parts.length === 3 && parts[2].length === 0)) {
    name[1] = parts[1];
  }

  if (parts.length === 3 && parts[2].split('.').length > 1) {
    name[1] = parts[1];
    name[0] = parts[2];
  }

  return {name};
}

electedFiles.forEach(file => {
  var id = file.split('-')[0];

  if (!electedByParty[id]) {
    electedByParty[id] = [];
  }

  var html = fs.readFileSync(sourceDIR + 'mandaty/' + file).toString();

  var rows = $('tr', html);

  Object.keys(rows).forEach(row => {
    if (rows[row].name) {
      if (rows[row].children) {
        if (rows[row].children.filter(c => c.name).length === 6) {
          electedByParty[id].push(parseName(rows[row].children.filter(c => c.name)[1].children[0].data));
        }
      }
    }
  });
});

var html = fs.readFileSync(sourceDIR + 'vysledky.html').toString();

var stats = {
  voters: 0,
  votes: 0,
  attended: 0,
  pct: 0
}

var cells = $('br + br + table tr + tr + tr td', html);

stats.voters = Number(cells[3].children[0].data.split(' ').join(''));
stats.votes = Number(cells[6].children[0].data.split(' ').join(''));
stats.attended = Number(cells[4].children[0].data.split(' ').join(''));
stats.pct = Number(cells[5].children[0].data);

var resultCells = $('table + br + table td[align="CENTER"]', html);

var json = {
  voters: stats.voters,
  votes: stats.votes,
  attended: stats.attended,
  pct: stats.pct,
  parties: []
}

Object.keys(resultCells).forEach(cellID => {
  var cell = resultCells[cellID];

  if (!cell.children || cell.children.length === 0 || typeof cell.children[0] === 'undefined') return;

  var obj = {};
  var party = patriesInElection.list.find(p => p.id[0] === Number(cell.children[0].data));

  if (party) {
    obj.id = party.id[0];
    obj.reg = party.reg;
    obj.name = party.name;
    obj.short = party.short || party.name;
    obj.elected = electedByParty[cell.children[0].data] || [];

    obj.votes = Number(cell.next.next.next.next.children[0].data.split(' ').join(''));
    obj.pct = Number(cell.next.next.next.next.next.next.children[0].data);
    obj.ptc = obj.pct;
  }

  json.parties.push(obj);
});

fs.writeFile(targetDIR + 'vysledky.json', JSON.stringify(json), err => {console.log(err)});
