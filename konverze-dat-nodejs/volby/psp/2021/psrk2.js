var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

// RUN

var target = 'data/volby/psp/2021/rejstrik/lide/data/';
var stats = 'zdroje/volby/psp/2021/sweep/detail/'
var sweepFile = 'zdroje/volby/psp/2021/sweep/psp-sweep.json';
var sweep = JSON.parse(fs.readFileSync(sweepFile));
var xml = fs.readFileSync('zdroje/volby/psp/2021/sweep/psrk.xml');

var i = 0;
var towns = [0, 554782, 554791, 582786, 554821, 554804, 555134, 563889, 505927];

parser.parseString(xml, (err, json) => {

  json.PS_REGKAND.PS_REGKAND_ROW.forEach(person => {
    var sw = sweep.find(x => x.nameFull[1] === person.JMENO[0] && x.nameFull[2] === person.PRIJMENI[0] && Number(person.NSTRANA[0]) === x.psp.election.nominee);

    if (sw) {

      var data = JSON.parse(fs.readFileSync(target + sw.hash + '.json'));

      data.home = {
        num: Number(person.BYDLISTEK[0]),
        name: person.BYDLISTEN[0]
      }

      if (data.home.num < 100000) {
        data.home.num = towns[data.home.num];
      }

      if (person.TITULPRED) data.nameFull[0] = person.TITULPRED[0];
      if (person.TITULZA) data.nameFull[3] = person.TITULZA[0];

      fs.writeFileSync('data/volby/psp/2021/rejstrik/lide/data/' + sw.hash + '.json', JSON.stringify(data, null, 2));
    }
  });
})
