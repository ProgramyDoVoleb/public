var fs = require('fs');

var year = 2002;

var sourceDIR = '../zdroje/volby/psp/' + year + '/';
var targetDIR = '../data/volby/psp/' + year + '/';

if (!fs.existsSync(targetDIR)) {
  fs.mkdir(targetDIR);
}

var patriesInElection = JSON.parse(fs.readFileSync(sourceDIR + 'strany.json'));
var partiesAll = JSON.parse(fs.readFileSync('../data/obecne/strany.json'));

var json = [];

patriesInElection.forEach(party => {
  var node = partiesAll.list.find(p => p.reg === party.reg);

  var obj = {
    reg: party.reg,
    id: [party.id],
    name: party.name || node.name,
    short: party.name || node.short,
    color: node.color,
    logo: node.logo
  }

  if (node.coalition) {
    obj.coalition = node.coalition;

    obj.coalition.forEach(member => {
      json.push(partiesAll.list.find(p => p.reg === member));
    });
  }

  json.push(obj);
});

json.sort((a, b) => a.reg - b.reg);

fs.writeFile(targetDIR + 'strany.json', JSON.stringify({
  created: new Date().getTime(),
  list: json
}), err => {console.log(err)});
