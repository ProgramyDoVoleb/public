var fs = require('fs');

var strany = JSON.parse(fs.readFileSync('data/obecne/strany.json'));
var kandidati = JSON.parse(fs.readFileSync('data/volby/senat/20201002/kandidati.json'))

var vybrane = [];
var dyn = [];
var cands = [];

function add (reg) {
  if (typeof reg === 'number') {
    if (!vybrane.find(x => x.reg === reg)) {
      var party = strany.list.find(x => x.reg === reg);

      if (party) {
        party.memberOf = undefined;
        party.activity = undefined;
        party.links = undefined;
        vybrane.push(party);
      }
    }
  }
}

kandidati.list.forEach(cand => {
  if (cand.member) add(cand.member);
  if (cand.nominee) add(cand.nominee);
  if (cand.party && cand.party.reg) add(cand.party.reg);

  if (cand.support) {
    cand.support.forEach(x => {
      if (typeof x === 'number') {
        add(x);
      }
    });
  } else {
    console.log(cand.name, 'no support');
  }

  var obj = {
    reg: cand.reg,
    no: cand.no,
    name: cand.name[1] + ' ' + cand.name[2],
    motto: cand.motto,
    program: cand.program,
    about: cand.about,
    links: cand.links,
    support: cand.support,
    answers: cand.answers
  }

  var c = cand;
      c.motto = undefined;
      c.program = undefined;
      c.about = undefined;
      c.links = [];
      c.support = [];
      c.answers = undefined;

  dyn.push(obj);
  cands.push(c);
});

vybrane.forEach(x => console.log(x.reg, x.name));

fs.writeFileSync('data/volby/senat/20201002/strany.json', JSON.stringify(vybrane));

fs.writeFileSync('data/volby/senat/20201002/dynamicke.json', JSON.stringify({list: dyn}, null, 2));

fs.writeFileSync('data/volby/senat/20201002/kandidati-komprese.json', JSON.stringify({list: cands, current: kandidati.current, clubs: kandidati.clubs}));
