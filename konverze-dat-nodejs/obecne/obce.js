var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

function writeJSON (json) {
  fs.writeFile("../data/obecne/obce.json", JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

function writeJSON2 (json) {
  fs.writeFile("../data/obecne/obce-struktura.json", JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

var regionFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/obecne/cnumnuts-utf8.xml', function(err, content) {
    parser.parseString(content, function (err, json) {
      resolve(json);
    });
  });
});

var cityFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/obecne/cisob-utf8.xml', function(err, content) {
    parser.parseString(content, function (err, json) {
      resolve(json);
    });
  });
});

var areaFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/obecne/epcoco-utf8.xml', function(err, content) {
    parser.parseString(content, function (err, json) {
      resolve(json);
    });
  });
});

function createHierarchy(nums) {

  var hierarchy = {
    num: 0,
    name: "Česká republika",
    list: [],
    nuts: "CZ"
  }

  var regions = [];
  var areas = [];

  nums.CNUMNUTS.CNUMNUTS_ROW.forEach(num => {
    if (num.NUMNUTS[0] === "0" || num.NUMNUTS[0] === "9999") return;

    if (Number(num.NUMNUTS[0]) % 1000 === 0) {
      hierarchy.list.push({
        num: Number(num.NUMNUTS[0]),
        name: num.NAZEVNUTS[0],
        list: [],
        nuts: num.NUTS[0]
      });
    } else {
      var areaID = Math.floor(Number(num.NUMNUTS[0]) / 1000)*1000;
      var area = hierarchy.list.find(a => a.num === areaID);

      if (Number(num.NUMNUTS[0] - areaID) % 100 === 0) {

        var a = {
          num: Number(num.NUMNUTS[0]),
          name: num.NAZEVNUTS[0],
          nuts: num.NUTS[0],
          list: []
        };

        regions.push({
          id: a.num,
          name: a.name,
          nuts: a.nuts
        })

        area.list.push(a);
      } else {
        var regID = Math.floor(Number(num.NUMNUTS[0]) / 100)*100;
        var reg = area.list.find(a => a.num === regID);

        var b = {
          num: Number(num.NUMNUTS[0]),
          name: num.NAZEVNUTS[0],
          nuts: num.NUTS[0],
          list: []
        }

        reg.list.push(b)

        areas.push({
          id: b.num,
          name: b.name,
          nuts: b.nuts,
          in: regID
        })
      }
    }
  });

  return {created: new Date().getTime(), hierarchy, regions, areas};
}

Promise.all([regionFile, areaFile, cityFile]).then(function (values) {

  var cz = createHierarchy(values[0]);

  var json = {
    created: new Date().getTime(),
    regions: cz.regions,
    areas: cz.areas,
    list: []
  };

  values[1].EP_COCO.EP_COCO_ROW.forEach(item => {

    var o = {
      id: Number(item.OBEC[0]),
      name: item.NAZEVOBCE[0]
    };

    if (Number(item.OBEC[0]) != Number(item.OBEC_PREZ[0])) {

      var city = values[2].CISOB.CISOB_ROW.find(c => Number(c.OBEC_PREZ[0]) === Number(item.OBEC_PREZ[0]));

      if (city) {
        o.city = {
          id: Number(city.OBEC_PREZ[0]),
          name: city.NAZEVOBCE[0]
        }
      }
    }

    var area = values[0].CNUMNUTS.CNUMNUTS_ROW.find(c => Number(c.NUMNUTS[0]) === Number(item.OKRES[0]));
    var region = values[0].CNUMNUTS.CNUMNUTS_ROW.find(c => Number(c.NUMNUTS[0]) === Number(item.KRAJ[0]));

    o.in = Number(area.NUMNUTS[0]);

    json.list.push(o);

    var a1 = cz.hierarchy.list.find(a => a.num === Math.floor(Number(region.NUMNUTS[0]) / 1000)*1000);
    var a2 = a1.list.find(a => a.num === Number(region.NUMNUTS[0]));
    var a3 = a2.list.find(a => a.num === Number(area.NUMNUTS[0]));

    if (!a3) a3 = a2;

    var a4 = undefined;

    if (o.city) {
      a4 = a3.list.find(a => a.num === o.city.id);

      if (a4) {
        // console.log(a4);
      } else {
        a4 = {
          num: o.city.id,
          name: o.city.name,
          list: []
        }

        a3.list.push(a4);
      }
    } else {
      a4 = a3;
    }

    a4.list.push({
      num: o.id,
      name: o.name
    });
  });

  writeJSON(json);
  writeJSON2(cz);

  createTownDirectory(cz);
});

return;
