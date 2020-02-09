var fs = require('fs');

var parties = JSON.parse(fs.readFileSync('../data/obecne/strany.json'));

var color = [];

parties.list.forEach(party => {
  if (party.color != '#aaa') {
    color.push({
      reg: party.reg,
      color: party.color
    })
  }
});

fs.writeFile('../data/obecne/strany/barvy.json', JSON.stringify(color), err => {})
