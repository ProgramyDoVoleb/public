var fs = require('fs');

var json = JSON.parse(fs.readFileSync('data/obecne/senatni-obvody-svg.json'))

json.forEach((o, i) => {
  if (i > 80) return;

  var f = 'data/obecne/obce-v-obvodech/' + (i + 1);
  var ff = fs.readFileSync(f + '.json');

  if (ff) {
    var obv = JSON.parse(ff)

    obv.svg = [[15, 50], [16, 51]];

    fs.writeFileSync(f + '.json', JSON.stringify(obv, null, 2));
    fs.writeFileSync('data/obecne/info/obvody/' + (i + 1) + '.svg', '<svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg"><path d="' + o + '" /></svg>');
  }
});
