var fs = require('fs');

var json = JSON.parse(fs.readFileSync('data/obecne/obce-flat.json')).list;
var regions = JSON.parse(fs.readFileSync('data/obecne/kraje-flat.json')).list;
var senate = JSON.parse(fs.readFileSync('data/obecne/senatni-volby.json')).list;

regions.forEach(r => r.list = []);
senate.forEach(s => s.list = []);

Object.keys(json).forEach(key => {
  var reg = regions.find(x => x.nuts === key.slice(0, 5));

  json[key].forEach(town => {
    reg.list.push(town);

    var s = senate.find(x => x.id === town[1]);
    if (s) s.list.push(town);
  });
});

regions.forEach((r, index) => {
  r.list.sort((a, b) => a[6].localeCompare(b[6], 'cs'));
  fs.writeFileSync('data/obecne/obce-v-krajich/' + index + '.json', JSON.stringify(r, null, 2));
})

senate.forEach((r, index) => {
  r.list.sort((a, b) => a[6].localeCompare(b[6], 'cs'));
  fs.writeFileSync('data/obecne/obce-v-obvodech/' + r.id + '.json', JSON.stringify(r, null, 2));
})
