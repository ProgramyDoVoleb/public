var fs = require('fs');

var parties = JSON.parse(fs.readFileSync('../data/obecne/strany.json'));
var color = JSON.parse(fs.readFileSync('../data/obecne/strany/barvy.json'));

color.forEach((item, i) => {
  var party = parties.list.find(x => x.reg === item.reg);

  if (party) {
    party.color = item.color;
  }
});


fs.writeFile('../data/obecne/strany.json', JSON.stringify(parties), err => {})
