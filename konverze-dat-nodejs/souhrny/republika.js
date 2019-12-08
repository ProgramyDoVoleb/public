var fs = require('fs');

function writeJSON (json, file) {
  fs.writeFile(file, JSON.stringify(json), function(err) {
      if(err) {
          return console.log(err);
      }
  });
}

var hierarchyFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/obce-struktura.json', function(err, content) {
    resolve(JSON.parse(content));
  });
});

function processType(years, path, o) {
  var results = [];

  years.forEach(year => {
    results.push({
      year: year,
      data: JSON.parse(fs.readFileSync('../data/volby/' + path + '/' + year + '/vysledky.json'))
    })
  })

  results.forEach(election => {
    var el = election.data;
        el.year = election.year;

    o.push(el);
  });
}

function processFile(o) {
  try {
    processType([2013, 2018], "p", o.volby.prezident);
    processType([2006, 2010, 2013, 2017], "psp", o.volby.snemovna);
    processType([2004, 2009, 2014, 2019], "ep", o.volby.eu);
  } catch (e) {
    console.log(e);
  }
}

Promise.all([hierarchyFile]).then(values => {
  var o = {
    num: 0,
    name: "Česká republika",
    nuts: "CZ01",
    volby: {
      prezident: [],
      snemovna: [],
      eu: []
    }
  };

  processFile(o);

  writeJSON(o, '../data/souhrny/republika/souhrn.json');
});
