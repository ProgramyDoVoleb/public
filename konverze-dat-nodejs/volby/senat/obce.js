var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var set1 = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/obecne/secoco-2014.xml', function(err, data) {
    parser.parseString(data, function (err, json) {
      resolve(json);
    });
  })
});

var set2 = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/obecne/secoco-2016.xml', function(err, data) {
    parser.parseString(data, function (err, json) {
      resolve(json);
    });
  })
});

var set3 = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/obecne/secoco-2018.xml', function(err, data) {
    parser.parseString(data, function (err, json) {
      resolve(json);
    });
  })
});

var areas = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/senatni-obvody.json', function(err, data) {
    resolve(JSON.parse(data));
  })
});

var towns = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/obce-struktura.json', function(err, data) {
    resolve(JSON.parse(data));
  })
});

function getTownArea (id, values) {
  var area = values[0].SE_COCO.SE_COCO_ROW.find(town => Number(town.OBEC[0]) === id);
      area = area || values[1].SE_COCO.SE_COCO_ROW.find(town => Number(town.OBEC[0]) === id);
      area = area || values[2].SE_COCO.SE_COCO_ROW.find(town => Number(town.OBEC[0]) === id);

  return area ? Number(area.OBVOD[0]) : undefined;
}

function processTown (nuts, town, values) {
  var area = getTownArea(town.num, values);

  if (area) {
    var so = values[3].list.find(a => a.id === area);

    var check = so.towns.find(t => t.num === town.num);

    if (!check) {
      so.towns.push(town);
    }

    updateTownFile (nuts, town, area, so.name, so.votes);
  } else {
    console.log(town.num, town.name, nuts, "no area, but maybe deeper");
  }

  if (town.list) {
    town.list.forEach(part => {
      processTown(nuts, part, values);
    })
  }
}

function updateTownFile (nuts, town, soNumber, soName, soVotes) {
  try {
    fs.readFile('../data/obecne/obce/' + nuts + '/' + town.num + '.json', function(err, data) {
      if (data) {
        var json = JSON.parse(data);

        json.obvod = {
          id: soNumber,
          name: soName
        }

        json.volby.senat = soVotes;

        fs.writeFile('../data/obecne/obce/' + nuts + '/' + town.num + '.json', JSON.stringify(json), function(err) {
            if(err) {
                return console.log(err);
            }
        });
      }
    })
  } catch (e) {
    console.log("Error with town file", nuts, town);
  }
}

function writeResults (json) {

  fs.writeFile('../data/obecne/senatni-obvody.json', JSON.stringify(json), function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("SO saved");
  });
}

Promise.all([set1, set2, set3, areas, towns]).then(values => {

  try {

    values[4].hierarchy.list.forEach(reg => {
      reg.list.forEach(kraj => {
        kraj.list.forEach(okres => {

          var nuts = okres.nuts;

          console.log(nuts);

          if (nuts) {
            okres.list.forEach(mesto => {
              processTown(nuts, mesto, values);
            })
          }
        });
      })
    })

  } catch (e) {
    console.log(e);
  }

  writeResults(values[3]);
});
