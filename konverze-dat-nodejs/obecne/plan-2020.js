var fs = require('fs');

var towns = JSON.parse(fs.readFileSync('../data/obecne/obce-flat.json'));

var json = {
  elections: [
    {
      kom6: [509108, 531111, 563897],
      sen6: [32],
      sen10: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81],
      kr10: JSON.parse(fs.readFileSync('../data/obecne/kraje-flat.json')).list.splice(1, 14).map(x => x.nuts)
    }
  ],
  regions: JSON.parse(fs.readFileSync('../data/obecne/kraje-flat.json')).list,
  districts: JSON.parse(fs.readFileSync('../data/obecne/okresy-flat.json')).list,
  senate: JSON.parse(fs.readFileSync('../data/obecne/senatni-volby.json')).list,
  towns: []
};

Object.keys(towns.list).forEach((district, i) => {
  towns.list[district].forEach((town, i) => {

    var f = JSON.parse(fs.readFileSync('../data/souhrny/obce/' + district + '/' + town[0] + '.json'));

    json.towns.push([
      town[0], // num
      town[1], // senate
      district, // okresu
      f.hierarchy.psc, // PSČ
      town[6]
    ])
  });
});


fs.writeFileSync('../data/volby/plan-2020.json', JSON.stringify(json));
