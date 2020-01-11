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
  popis: {
    'nuts: číslo okresu (po dělení 10 kraje)': {
      'obvod: senátní obvod, u více obvodů -1': [
        'num: číslo obce',
        'GPS lng',
        'GPS ltn',
        'velikost obce podle typu obce',
        'velikost obce podle 0-250-1000-2500-1000-25000-10000-více',
        'num: část obce'
      ]
    }
  } ,
  list: {}
};

var sum = 0;

var druhy = [
	0, //'obec',
	3, // 'město',
	4, // 'statutární město',
	5, // 'hlavní město',
	2, // 'městská část či obvod',
	1  // 'městys'
];

function getSize (size) {
  if (size < 250) {
    return 0
  } else if (size < 1000) {
    return 1
  } else if (size < 2500) {
    return 2
  } else if (size < 10000) {
    return 3
  } else if (size < 25000) {
    return 4
  } else if (size < 100000) {
    return 5
  } else if (size < 1000000){
    return 6
  } else {
    return 7
  }
}

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
      s: town.obvod ? town.obvod.id : -1,
      g: town.hierarchy.gps,
      p: druhy[town.stats.druh - 1],
      p2: town.stats.population.length > 0 ? getSize(town.stats.population[town.stats.population.length - 1].value) : 0,
      c: town.stats.population.length > 0 ? Math.round((town.stats.population[town.stats.population.length - 1].value - town.stats.population[0].value) / town.stats.population[0].value * 100) : 0
    }

    obj.g = [Math.round(obj.g.lng * 1000) / 1000, Math.round(obj.g.lnt * 1000) / 1000];

    if (!json.list[obj.o]) json.list[obj.o] = {};
    if (!json.list[obj.o][obj.s]) json.list[obj.o][obj.s] = [];

    if (obj.m === 0) {
      json.list[obj.o][obj.s].push([obj.id, obj.g[0], obj.g[1], obj.p, obj.p2, obj.n]);
    } else {
      sum++;
      json.list[obj.o][obj.s].push([obj.id, obj.g[0], obj.g[1], obj.p, obj.p2, obj.n, obj.m]);
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
