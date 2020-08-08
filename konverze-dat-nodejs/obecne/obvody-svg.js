var fs = require('fs');

var json = JSON.parse(fs.readFileSync('data/obecne/senatni-obvody-svg.json'))

json.forEach((o, i) => {
  if (i > 80) return;

  var f = 'data/obecne/obce-v-obvodech/' + (i + 1);
  var ff = fs.readFileSync(f + '.json');

  if (ff) {
    var obv = JSON.parse(ff)

    obv.svg = [[15, 50], [16, 51]];

    var c = []

    o.bb.forEach(b => {
      c.push(Math.round(Number(b)));
    })

    fs.writeFileSync(f + '.json', JSON.stringify(obv, null, 2));
    fs.writeFileSync('data/obecne/info/obvody/' + (i + 1) + '.svg', '<svg viewBox="' + c.join(' ') + '" xmlns="http://www.w3.org/2000/svg"><mask id="mm"><path d="' + o.d + '" fill="#000" /></mask><rect x="-10000" y="-10000" width="30000" height="30000" fill="#000" opacity=".3" /></svg>');
  }
});
