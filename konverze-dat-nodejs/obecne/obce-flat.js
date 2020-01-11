var fs = require('fs');

function writeFile (json, to) {
  fs.writeFile(to, JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }
  });
}

var cz = JSON.parse(fs.readFileSync('../data/obecne/obce-struktura.json'));
var json = {
  list: []
};

var sum = 0;

function processNum (num, nuts, num2, name) {
  var file = '../data/souhrny/obce/' + nuts + '/' + num + '.json';

  var town = JSON.parse(fs.readFileSync(file));

  // console.log(nuts, num);

  if (town) {
    var obj = {
      id: num,
      n: town.name,
      k: Number(town.hierarchy.kraj.nuts.split("CZ0")[1]),
      o: Number(town.hierarchy.okres.nuts.split("CZ0")[1]),
      m: town.hierarchy.mesto ? town.hierarchy.mesto.num : 0,
      s: town.hierarchy.obvod ? town.hierarchy.obvod.id : 0,
      g: town.hierarchy.gps,
      p: town.stats.population.length > 0 ? town.stats.population[town.stats.population.length - 1].value.toString().length : 0,
      c: town.stats.population.length > 0 ? Math.round((town.stats.population[town.stats.population.length - 1].value - town.stats.population[0].value) / town.stats.population[0].value * 100) : 0
    }

    obj.g = [Math.round(obj.g.lng * 1000) / 1000, Math.round(obj.g.lnt * 1000) / 1000];

    if (obj.m === 0) {
      json.list.push([obj.id, obj.o, obj.s, obj.g[0], obj.g[1], obj.p, obj.n]);
    } else {
      sum++;
      console.log(obj.n);
      json.list.push([obj.id, obj.o, obj.s, obj.g[0], obj.g[1], obj.p, obj.n, obj.m]);
    }
  }
}

cz.hierarchy.list.forEach(reg => {
  reg.list.forEach(kraj => {
    kraj.list.forEach(okres => {
      okres.list.forEach(obec => {
        processNum(obec.num, okres.nuts || 'CZ0100');

        if (obec.list) {
          obec.list.forEach(part => {
            processNum(part.num, okres.nuts || 'CZ0100', obec.num, obec.name);
          });
        }
      });
    });
  });
})

console.log(sum);

writeFile(json, '../data/obecne/obce-flat.json');
