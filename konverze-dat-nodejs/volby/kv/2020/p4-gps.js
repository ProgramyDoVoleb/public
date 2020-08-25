var fs = require('fs')

var regionIDList = ['pha', 'stk', 'jck', 'plk', 'kvk', 'ulk', 'lbk', 'khk', 'pak', 'vys', 'jmk', 'olk', 'zlk', 'msk']

var json = JSON.parse(fs.readFileSync('./data/volby/kv/2020/list2.json'));

var towns = JSON.parse(fs.readFileSync('./data/obecne/obce-flat.json'));

var index = [];

Object.keys(towns.list).forEach(key => {
  towns.list[key].forEach(town => {
    index.push({num: town[0], gps: [town[2], town[3]]});
  });
});

json.list.forEach(region => {

  region.parties.forEach(party => {

    var file = './data/volby/kv/2020/data/' + party.data + '.json';

    var data = JSON.parse(fs.readFileSync(file));

    if (data.list) {
      data.list.forEach(person => {
        var num = person.homeMeta.num;

        if (num === 2) num = 554791; // plzen
        if (num === 7) num = 563889; // liberec
        if (num === 6) num = 555134; // pardubice
        if (num === 3) num = 582786; // brno
        if (num === 4) num = 554821; // ostrava

        var t = index.find(x => x.num === num);

        if (t) {
          person.homeMeta.gps = t.gps;
        } else {
          console.log(region.id, party.reg, person.nameFull[2], person.homeMeta.num, person.home);
        }
      });
    }

    fs.writeFileSync(file, JSON.stringify(data, null, 2))
  });
});
