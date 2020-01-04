var fs = require('fs');

var year = 2010;

function writeResults (json) {
  fs.writeFile("../data/volby/kom/" + year + "/vysledky.json", JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

var json = {
  created: new Date().getTime(),
  list: []
}

const nutsList = fs.readdirSync('../data/souhrny/obce', { withFileTypes: true })

nutsList.forEach(nuts => {
  if (nuts != '.DS_Store') {

    var obj = {
      nuts,
      list: []
    };

    json.list.push(obj);

    numList = fs.readdirSync('../data/souhrny/obce/' + nuts, { withFileTypes: true })

    numList.forEach(num => {
      var town = JSON.parse(fs.readFileSync('../data/souhrny/obce/' + nuts + '/' + num));

      var o = {
        id: town.id,
        name: town.name,
        parties: []
      }

      obj.list.push(o);

      try {
        var election = town.volby.obce.find(el => el.year = year);

        if (election) {
          election.parts[0].results.forEach(party => {
            var p = {
              reg: party.reg,
              name: party.name,
              votes: party.votes,
              pct: party.pct,
              seats: party.list ? party.list.length : 0
            }

            o.parties.push(p);
          });
        }
      } catch (e) {
        console.log(nuts, num, e);
      }

    });

  }
});

writeResults(json);
