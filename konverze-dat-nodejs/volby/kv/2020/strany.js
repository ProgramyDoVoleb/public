var fs = require('fs');

var strany = JSON.parse(fs.readFileSync('../data/obecne/strany.json'));
var election = JSON.parse(fs.readFileSync('../data/volby/kv/2020/list.json'));

var json = {
  list: []
}

function add(reg) {
  if (!json.list.find(x => x.reg === reg)) {
    var obj = {};
    var party = strany.list.find(x => x.reg === reg);

    obj.reg = party.reg;
    obj.name = party.name;
    obj.short = party.short;
    obj.color = party.color;
    obj.logo = party.logo;
    obj.hash = party.hash;

    json.list.push(obj);
  }
}

election.list.forEach(region => {
  region.parties.forEach(cand => {
    if (cand.reg) add(cand.reg);
    if (cand.coalition) {
      cand.coalition.forEach(member => {
        if (typeof member === 'number') add(member);
      })
    }
    if (cand.support) {
      cand.support.forEach(member => {
        if (typeof member === 'number') add(member);
      })
    }
  })
});

json.list.sort((a, b) => a.reg - b.reg);

fs.writeFileSync('../data/volby/kv/2020/strany.json', JSON.stringify(json));
