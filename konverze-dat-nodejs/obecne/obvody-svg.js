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
    fs.writeFileSync('data/obecne/info/obvody/' + (i + 1) + '.svg', '<svg viewBox="' + c.join(' ') + '" xmlns="http://www.w3.org/2000/svg"><defs><filter id="f1" x="0" y="0" width="130%" height="130%"><feOffset result="offOut" in="SourceAlpha" dx="1" dy="1" /><feGaussianBlur result="blurOut" in="offOut" stdDeviation="2" /><feBlend in="SourceGraphic" in2="blurOut" mode="normal" /></filter></defs><path d="' + o.d + '" stroke="#c00" stroke-width=".2" fill="transparent" filter="url(#f1)" /></svg>');
  }
});
