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

dates.forEach(date => {
  var content = JSON.parse(fs.readFileSync('../data/volby/senat/' + date.date + '/vysledky.json'));

  content.areas.forEach(obvod => {
    var ar = area.find(a => a.id === obvod.id);
        ar.name = obvod.name;

    var o = {
      date: content.date,
      regular: content.regular,
      round1: obvod.round1,
      round2: obvod.round2
    };

    ar.elections.push(o);
  });
});

area.forEach(a => {
  writeJSON(a, '../data/souhrny/obvody/' + a.id + '.json');
})
