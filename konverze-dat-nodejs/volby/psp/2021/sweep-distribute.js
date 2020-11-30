var fs = require('fs');

var sweepFile = 'zdroje/volby/psp/2021/sweep/psp-sweep.json';
var sweep = JSON.parse(fs.readFileSync(sweepFile));

sweep.forEach(member => {
  member.photo = {
    source: 'https://data.programydovoleb.cz/volby/psp/2021/rejstrik/lide/fotky/' + member.hash + '.jpg',
    licence: 'Použití fotografie je se svolením ředitele tiskového odboru PSP, Romana Žambocha, ze dne 11. listopadu 2020'
  }

  fs.writeFileSync('data/volby/psp/2021/rejstrik/lide/data/' + member.hash + '.json', JSON.stringify(member, null, 2));

  fs.copyFileSync('zdroje/volby/psp/2021/sweep/photo/' + member.psp.id + '.jpg', 'data/volby/psp/2021/rejstrik/lide/fotky/' + member.hash + '.jpg');
});
