var fs = require('fs');

var hierarchyFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/obce-struktura.json', function(err, content) {
    resolve(JSON.parse(content));
  });
});

function writeTown (json, to) {
  fs.writeFile(to, JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved: " + to);
  });
}

Promise.all([hierarchyFile]).then(function (values) {
  var cz = values[0].hierarchy.list;

  cz.forEach(reg => {
    reg.list.forEach(kraj => {

      kraj.list.forEach(okres => {

        var dir = "../data/obecne/obce/" + (okres.nuts || "CZ0100");

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        okres.list.forEach(obec => {
          if (!fs.existsSync(dir + "/" + obec.num + ".json")) {
            var o = {
              id: obec.num,
              name: obec.name,
              nuts: okres.nuts,
              okres: okres.num,
              kraj: kraj.num,
              volby: {
                prezident: [],
                snemovna: [],
                senat: [],
                kraje: [],
                obce: [],
                eu: []
              }
            }

            writeTown(o, dir + "/" + obec.num + ".json");

            if (obec.list) {
              obec.list.forEach(ctvrt => {

                var o = {
                  id: ctvrt.num,
                  name: ctvrt.name,
                  nuts: okres.nuts,
                  mesto: obec.num,
                  okres: okres.num,
                  kraj: kraj.num,
                  volby: {
                    prezident: [],
                    snemovna: [],
                    senat: [],
                    kraje: [],
                    obce: [],
                    eu: []
                  }
                }

                writeTown(o, dir + "/" + ctvrt.num + ".json");

              });
            }
          }
        });
      });
    })
  })
});
