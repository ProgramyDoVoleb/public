var fs = require('fs');

var kandidati = JSON.parse(fs.readFileSync('data/volby/senat/20201002/dynamicke.json'));
var odds = JSON.parse(fs.readFileSync('data/volby/senat/20201002/odds.json'));

odds.forEach(odd => {
  var name = odd.name[1] + ' ' + odd.name[0];

  if (odd.name[0] === 'Kubín') name = 'Jan Michael Kubín';
  if (odd.name[0] === 'Groene') name = 'Lucie Frederika Groene Odkolek';
  if (odd.name[0] === 'Brožová') name = 'Jaroslava Brožová Lampertová';
  if (odd.name[0] === 'Štruplová') name = 'Šárka Štruplová Růžičková';
  if (odd.name[0] === 'Kuznik') name = 'Lubomír Kuzník';

  var cand = kandidati.list.find(x => x.name === name);

  if (cand) {
    cand.odds = Number(odd.odds);
  } else {
    console.log(odd);
  }
});

fs.writeFileSync('data/volby/senat/20201002/dynamicke.json', JSON.stringify(kandidati, null, 2));
