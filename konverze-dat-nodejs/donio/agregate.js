var fs = require('fs');

var json = JSON.parse(fs.readFileSync('data/obecne/obce-flat.json')).list;
var parties = JSON.parse(fs.readFileSync('data/volby/kv/2020/strany-2.json')).list;

var output = {
  parties: [],
  towns: [],
  people: [],
  votes: 79783,
  voters: 231523,
  pct: 34.94
};

Object.keys(json).forEach(key => {
  if (key.charAt(3) === '4' && key.charAt(4) === '1') {
    var towns = json[key];

    towns.forEach(town => {
      var obj = {
        num: town[0],
        name: town[6],
        gps: [town[2], town[3]],
        size: town[5],
        district: key,
        voters: null,
        pct: null,
        results: null
      }

      var data = JSON.parse(fs.readFileSync('data/souhrny/obce/' + obj.district + '/' + obj.num + '.json'));

      if (data) {
        var el = data.volby.kraje.find(x => x.year === 2020);

        obj.voters = el.stats.voters;
        obj.pct = el.stats.pct;
        obj.results = el.result;

        obj.results.sort((a, b) => b.votes - a.votes);

        obj.results.forEach(r => {
          if (!output.parties.find(x => x.reg === r.reg)) {

            var d = parties.find(x => x.reg === r.reg);

            output.parties.push({
              name: d.name,
              short: d.short,
              logo: d.logo,
              color: d.color,
              hash: d.hash,
              reg: d.reg,
              results: {}
            });
          }
        })

      } else {
        console.log('chyba v ' + obj.num);
      }

      output.towns.push(obj);
    })
  }
});

fs.readdirSync('data/volby/kv/2020/data/kvk').forEach(file => {
  var data = JSON.parse(fs.readFileSync('data/volby/kv/2020/data/kvk/' + file));

  data.list.forEach(person => {
    var obj = {
      nameFull: person.nameFull,
      age: person.age,
      sex: person.sex,
      home: person.home,
      reg: person.reg,
      nominee: person.nominee,
      photo: person.photo,
      elected: false
    }

    output.people.push(obj);
  });
});

var elected = JSON.parse(fs.readFileSync('data/volby/kv/2020/vysledky.json'))[3].parties;

elected.forEach(party => {
  var d = output.parties.find(x => x.reg === party.reg);

  if (d) {
    d.results.votes = party.votes;
    d.results.pct = party.pct;
    d.results.elected = party.elected.length;
  } else {
    console.log(party);
  }

  party.elected.forEach(p => {
    var px = output.people.find(x => x.nameFull[1] === p.name[1] && x.nameFull[2] === p.name[2]);

    if (px) px.elected = true;
  });
});

fs.writeFileSync('konverze-dat-nodejs/donio/data/kvk.json', JSON.stringify(output, null, 2));
