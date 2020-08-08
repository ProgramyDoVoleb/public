var fs = require('fs');

var json = JSON.parse(fs.readFileSync('data/obecne/senatni-obvody-svg.json'))

json.forEach((o, i) => {
  if (i > 80) return;

  var f = 'data/obecne/obce-v-obvodech/' + (i + 1) + '.json';
  var ff = fs.readFileSync(f);

  if (ff) {
    var obv = JSON.parse(ff)

    obv.svg = o;

    fs.writeFileSync(f, JSON.stringify(obv, null, 2));

    console.log(obv.id);
  }
});
