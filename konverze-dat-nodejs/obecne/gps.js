var fs = require('fs');

var gps = fs.readFileSync("../zdroje/obecne/gps.csv").toString().split('\n').map(p => p.split(','));

function writeFile (json, to) {
  fs.writeFile(to, JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }
  });
}

var cz = JSON.parse(fs.readFileSync('../data/obecne/obce-struktura.json'));

function processNum (num, nuts, num2, name) {
  var file = '../data/souhrny/obce/' + nuts + '/' + num + '.json';

    var json = JSON.parse(fs.readFileSync(file));
    var data = gps.find(d => Number(d[1]) === num);
    var data2;

    if (num2) data2 = gps.find(d => Number(d[1]) === num2);

    if (json && data) {

      hierarchy = {
        kraj: {
          nuts: data[5],
          name: data[4]
        },
        okres: {
          nuts: data[3],
          name: data[2]
        },
        obvod: json.obvod || {},
        psc: Number(data[6]),
        gps: {
          lnt: Number(data[7]),
          lng: Number(data[8])
        }
      };

      json.hierarchy = hierarchy;

      writeFile(json, file);

    } else if (json && data2) {

      hierarchy = {
        kraj: {
          nuts: data2[5],
          name: data2[4]
        },
        okres: {
          nuts: data2[3],
          name: data2[2]
        },
        mesto: {
          num: num2,
          name: name
        },
        obvod: json.obvod || {},
        // psc: Number(data[6]),
        gps: {
          lnt: Number(data2[7]),
          lng: Number(data2[8])
        }
      };

      json.hierarchy = hierarchy;

      writeFile(json, file);
    } else {
      console.log(num, nuts, 'nenalezeno GPS');
    }
  // } catch (e) {
  //   console.log(num, nuts, e);
  // }
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
