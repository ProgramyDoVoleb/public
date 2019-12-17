var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

function writeJSON (json, file) {
  fs.writeFile(file, JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }
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
  fs.readdir("../data/obecne/strany/loga", function (err, list) {
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
    return "/data/obecne/strany/loga/" + item.path;
  } else {
    return undefined;
  }
}

function createHash (str) {

  str = str.toLowerCase();
  str = str.split("á").join("a");
  str = str.split("č").join("c");
  str = str.split("ď").join("d");
  str = str.split("é").join("e");
  str = str.split("ě").join("e");
  str = str.split("í").join("i");
  str = str.split("ň").join("n");
  str = str.split("ó").join("o");
  str = str.split("ř").join("r");
  str = str.split("š").join("s");
  str = str.split("ť").join("t");
  str = str.split("ú").join("u");
  str = str.split("ů").join("u");
  str = str.split("ý").join("y");
  str = str.split("ž").join("z");
  str = str.split(" ").join("-");
  str = str.split("/").join("-");
  str = str.split(",").join("-");
  str = str.split('"').join("");
  str = str.split('.').join("-");
  str = str.split('+').join("-");
  str = str.split('?').join("");

  return str;
}

Promise.all([partiesFile, logoFile]).then(function (values) {

  var json = {
    created: new Date().getTime(),
    list: []
  };

  values[0].CVS.CVS_ROW.forEach(item => {

    var short = item.ZKRATKAV8 ? item.ZKRATKAV8[0] : item.ZKRATKAV30[0];
    var hash = createHash(short);
    var reg = Number(item.VSTRANA[0])

    var o;

    try {
      o = JSON.parse(fs.readFileSync("../data/obecne/strany/data/" + reg + "-" + hash + ".json"))
    } catch (e) {
      o = {
        reg: reg
      };
    }

    o.name = item.NAZEVCELK[0];
    o.hash = hash;
    o.short = short;

    if (item.TYPVS[0] === "K") {
      o.coalition = item.SLOZENI[0].split(",").map(it => Number(it));
    }

    if (!o.links) {
      o.links = [];
    }

    o.logo = getLogo(o.reg, values[1]);

    if (reg===768) console.log(o);

    writeJSON(o, "../data/obecne/strany/data/" + reg + "-" + hash + ".json");

    json.list.push(o);
  });

  writeJSON(json, "../data/obecne/strany.json");
});

return;
