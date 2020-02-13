var fs = require('fs');
var $ = require('cheerio');

var year = 2004;

var sourceDIR = '../zdroje/volby/kv/' + year + '/';
var targetDIR = '../data/volby/kv/' + year + '/';

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

  // if (file != '1-503410.html') return;

  setTimeout(() => {

    var id = Number(file.split('.html')[0].split('-')[1]);

    console.log(id, index, 'of', electionFiles.length);

    var html = fs.readFileSync(sourceDIR + 'obce/' + file).toString();

    var townKnown = townsList.find(t => t[0] === id);
    var town;

    if (townKnown) {
      town = JSON.parse(fs.readFileSync('../data/souhrny/obce/' + townKnown[1] + '/' + townKnown[0] + '.json'));

      var stats = {}, result = [];

      var tables = $('table', html);

      // STATS

      var htmlStats = $('td', tables[0]);

      stats.voters = Number(htmlStats[3].children[0].data.split(' ').join(''));
      stats.votes = Number(htmlStats[7].children[0].data.split(' ').join(''));
      stats.attended = Number(htmlStats[4].children[0].data.split(' ').join(''));
      stats.pct = Number(htmlStats[5].children[0].data);

      // RESULTS

      var rowsResults = $('td table tr', tables[1]);

      Object.keys(rowsResults).forEach(row => {
        var cells = $('td', rowsResults[row]);

        if (cells.length > 0) {
          if (cells[0].children[0].data && cells[0].children[0].data.trim() != "") {
            var party = patriesInElection.list.find(p => p.id === Number(cells[0].children[0].data.trim()));

            if (party) {
              var obj = {};
                  obj.id = party.id;
                  obj.reg = party.reg;
                  obj.name = party.name;
                  obj.votes = Number(cells[2].children[0].data.split(' ').join(""));
                  obj.pct = Number(cells[3].children[0].data.split(' ').join(""));

              result.push(obj);
            }
          }
        }
      });

      // STORE

      var electionData = {
        year,
        stats,
        result
      }

      var el = town.volby.kraje.find(y => y.year === year);

      if (el) {
        town.volby.kraje.splice(town.volby.kraje.indexOf(el), 1);
      }

      town.volby.kraje.push(electionData);

      fs.writeFile('../data/souhrny/obce/' + townKnown[1] + '/' + townKnown[0] + '.json', JSON.stringify(town), err => {});

    } else {
      console.log('Neznámá obec', id);
    }
  }, index * 25)
});
