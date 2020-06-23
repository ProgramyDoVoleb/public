var fs = require('fs');

var source = JSON.parse(fs.readFileSync('../data/volby/senat/20201000/kandidati.json'));

var parties = JSON.parse(fs.readFileSync('../data/obecne/strany.json'));

var json = {list: [], current: source.current, clubs: source.clubs};

source.list.forEach(item => {
  var obj = {
    name: item.name,
    reg: item.reg,
    links: [],
    support: [],
    work: item.work
  }

  if (item.member) {
    if (item.member != 99) obj.support.push(item.member);
    obj.member = item.member;
  }

  if (item.nominee) {
    obj.nominee = item.nominee;
  }

  if (item.nominee && item.member && item.member != item.nominee) {
    if (item.nominee != 99) obj.support.push(item.nominee);
  }

  if (item.support) {
    item.support.forEach(sup => obj.support.push(sup));
  }

  if (item.links) {
    item.links.forEach(link => obj.links.push(link.url))
  }

  if (obj.support.length > 0) {
    var party = parties.list.find(x => x.reg === obj.support[0]);

    if (party) obj.color = party.color;
  }

  json.list.push(obj);
});

fs.writeFileSync('../data/volby/senat/20201002/kandidati.json', JSON.stringify(json));
