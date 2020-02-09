var fs = require('fs');
var $ = require('cheerio');

var year = 1996;

var sourceDIR = '../zdroje/volby/psp/' + year + '/';
var targetDIR = '../data/volby/psp/' + year + '/';

var patriesInElection = JSON.parse(fs.readFileSync(targetDIR + 'strany.json'));
var townsListFile = JSON.parse(fs.readFileSync('../data/obecne/obce-flat.json'));
var townsList = [];

Object.keys(townsListFile.list).forEach(region => {
  townsListFile.list[region].forEach(town => {
    townsList.push([
      town[0],
      region
    ]);
  });
});

var electionFiles = fs.readdirSync(sourceDIR + 'obce/');

electionFiles.forEach((file, index) => {

  setTimeout(() => {

    var id = Number(file.split('.html')[0].split('-')[2]);

    console.log(id, index, 'of', electionFiles.length);

    // if (id != 500054) return;

    var html = fs.readFileSync(sourceDIR + 'obce/' + file).toString();

    var townKnown = townsList.find(t => t[0] === id);
    var town;

    if (townKnown) {
      town = JSON.parse(fs.readFileSync('../data/souhrny/obce/' + townKnown[1] + '/' + townKnown[0] + '.json'));

      var tagHierarchy = $('div b', html);

      if (!town.hierarchy.krajStary) {
        town.hierarchy.krajStary = {
          numnuts: Number(file.split('.html')[0].split('-')[0]),
          name: tagHierarchy[0].children[0].data.split(' ', 2)[1]
        }
      }

      if (!town.hierarchy.okresStary) {
        town.hierarchy.okresStary = {
          numnuts: Number(file.split('.html')[0].split('-')[1]),
          name: tagHierarchy[1].children[0].data.split(' ', 2)[1]
        }
      }

      var stats = {}, result = [];

      var cells = $('br + br + table tr + tr + tr td', html);

      stats.voters = Number(cells[3].children[0].data.split(' ').join(''));
      stats.votes = Number(cells[6].children[0].data.split(' ').join(''));
      stats.attended = Number(cells[4].children[0].data.split(' ').join(''));
      stats.pct = Number(cells[5].children[0].data);

      var resultCells = $('table + br + table td:nth-child(1), table + br + table td:nth-child(6) ', html);

      Object.keys(resultCells).forEach(cellID => {
        var cell = resultCells[cellID];

        if (!cell.children || cell.children.length === 0 || typeof cell.children[0] === 'undefined') return;

        var obj = {};

        var party = patriesInElection.list.find(p => (p.id ? p.id[0] : [9870]) === Number(cell.children[0].children ? cell.children[0].children[0].data : cell.children[0].data));

        if (party) {
          obj.id = party.id[0];
          obj.reg = party.reg;
          obj.name = party.name;

          obj.votes = Number(cell.next.next.next.next.children[0].data.split(' ').join(''));
          obj.pct = Number(cell.next.next.next.next.next.next.children[0].data);
        }

        result.push(obj);
      });

      var electionData = {
        year,
        stats,
        result
      }

      var el = town.volby.snemovna.find(y => y.year === year);

      if (el) {
        town.volby.snemovna.splice(town.volby.snemovna.indexOf(el), 1);
      }

      town.volby.snemovna.push(electionData);

      fs.writeFile('../data/souhrny/obce/' + townKnown[1] + '/' + townKnown[0] + '.json', JSON.stringify(town), err => {console.log(err)});

    } else {
      console.log('Neznámá obec', id);
    }
  }, index * 30)
});
