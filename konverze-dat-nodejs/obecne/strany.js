var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

function writeJSON (json) {
  fs.writeFile("../data/obecne/strany.json", JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

var partiesFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/obecne/cvs-utf8.xml', function(err, content) {
    parser.parseString(content, function (err, json) {
      resolve(json);
    });
  });
});

var logoFile = new Promise (function (resolve, reject) {
  fs.readdir("../data/obecne/loga-stran", function (err, list) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    var json = [];
    var name = [];

    list.forEach(function (file) {
      name = file.split("-");
      json.push({
        id: Number(name[0]),
        path: file
      });
    });

    resolve(json);
  });
});

function getLogo (id, list) {
  var item = list.find(x => x.id === id);

  if (item) {
    return "/data/obecne/loga-stran/" + item.path;
  } else {
    return undefined;
  }
}

Promise.all([partiesFile, logoFile]).then(function (values) {

  var json = {
    created: new Date().getTime(),
    list: []
  };

  values[0].CVS.CVS_ROW.forEach(item => {

    var o = {
      reg: Number(item.VSTRANA[0]),
      name: item.NAZEVCELK[0]
    };

    o.short = item.ZKRATKAV8 ? item.ZKRATKAV8[0] : item.ZKRATKAV30[0]

    if (item.TYPVS[0] === "K") {
      o.coalition = item.SLOZENI[0].split(",").map(it => Number(it));
    }

    o.links = [];

    var logo = getLogo(o.reg, values[1]);

    if (logo) {
      o.logo = logo;
    }

    json.list.push(o);
  });

  writeJSON(json);
});

return;
