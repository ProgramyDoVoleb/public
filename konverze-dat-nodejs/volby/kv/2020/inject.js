var fs = require('fs');

var link = './data/volby/kv/2020/data/' + process.argv[2] + '.json';
var data = process.argv[3];

var party = JSON.parse(fs.readFileSync(link));

var json = JSON.parse(data);

json.forEach((p, i) => {
  party.list[i].age = p.age;
  party.list[i].work = p.work;
  party.list[i].home = p.home;
});

fs.writeFileSync(link, JSON.stringify(party, null, 2));
