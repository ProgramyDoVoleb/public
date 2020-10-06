var fs = require('fs');

var store = JSON.parse(fs.readFileSync('data/volby/senat/20201002/kandidati.json'));
var dyn = JSON.parse(fs.readFileSync('data/volby/senat/20201002/dynamicke.json'));

dyn.list.forEach(d => {
  var cand = store.list.find(x => x.reg === d.reg && x.no === d.no);

  if (!cand) {
    console.log(d);
  }

  cand.program = d.program || cand.program;
  cand.photo = d.photo || cand.photo;
  cand.motto = d.motto || cand.motto;
  if (cand.links.length === 0) cand.links = d.links || cand.links;
  if (cand.support.length === 0) cand.support = d.support || cand.support;
  if (d.answers) cand.answers = d.answers;
});

fs.writeFileSync('data/volby/senat/20201002/kandidati-combined.json', JSON.stringify(store));
