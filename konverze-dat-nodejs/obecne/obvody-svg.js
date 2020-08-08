var fs = require('fs');

var json = JSON.parse(fs.readFileSync('data/obecne/senatni-obvody-svg.json'))

json.forEach((o, i) => {
  if (i > 80) return;

  var f = 'data/obecne/obce-v-obvodech/' + (i + 1);
  var ff = fs.readFileSync(f + '.json');

  if (ff) {
    var obv = JSON.parse(ff)

    obv.svg = null;

    fs.writeFileSync(f + '.json', JSON.stringify(obv, null, 2));
    fs.writeFileSync('data/obecne/info/obvody/' + (i + 1) + '.svg', '<svg viewbox="0 0 500 600"><path d="' + o + '" /></svg>');
  }
});
