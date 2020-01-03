var fs = require('fs');

var dates = [
  {date: 20081017, type: 0},
  {date: 20101015, type: 0},
  {date: 20110318, type: 1},
  {date: 20121012, type: 0},
  {date: 20140110, type: 1},
  {date: 20140919, type: 1},
  {date: 20141010, type: 0},
  {date: 20161007, type: 0},
  {date: 20170127, type: 1},
  {date: 20180105, type: 1},
  {date: 20180518, type: 1},
  {date: 20181005, type: 0},
  {date: 20190405, type: 1}
];

var area = [];

for (var i = 1; i < 82; i++) {
  area.push({
    id: i,
    elections: []
  });
}

function writeJSON (json, file) {
  fs.writeFile(file, JSON.stringify(json), function(err) {
      if(err) {
          return console.log(err);
      }
  });
}

var simplified = {
  list: [],
  dates: []
};

function addToSimplifiedList (date, obvod) {
  var o = simplified.list.find(o => o.id === obvod.id);

  if (!o) {
    simplified.list.push({
      id: obvod.id,
      name: obvod.name
    });
  }

  var d = simplified.dates.find(d => d.date === date.date);

  if (!d) {
    d = {
      date: date.date,
      obvod: []
    }

    simplified.dates.push(d);
  }

  var od = d.obvod.find(o => o.id === obvod.id);

  if (!od) {
    d.obvod.push(obvod.id)
  }
}

dates.forEach(date => {
  var content = JSON.parse(fs.readFileSync('../data/volby/senat/' + date.date + '/vysledky.json'));
  var cand = JSON.parse(fs.readFileSync('../data/volby/senat/' + date.date + '/kandidati.json'));

  content.areas.forEach(obvod => {
    var ar = area.find(a => a.id === obvod.id);
        ar.name = obvod.name;

    var o = {
      date: content.date,
      regular: content.regular,
      results: {
        round1: obvod.round1,
        round2: obvod.round2
      },
      candidates: cand.list.filter(c => c.reg === obvod.id)
    };

    ar.elections.push(o);

    addToSimplifiedList(date, obvod);
  });
});

area.forEach(a => {
  writeJSON(a, '../data/souhrny/obvody/' + a.id + '.json');
})

writeJSON(simplified, '../data/obecne/senatni-volby.json');
