var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

function writeResults (json) {
  fs.writeFile("../data/volby/ep/2014/vysledky.json", JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
}

var cvsFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/obecne/strany.json', function(err, data) {
    resolve(JSON.parse(data));
  });
});

var partiesFile = new Promise (function (resolve, reject) {
  fs.readFile('../data/volby/ep/2014/strany.json', function(err, data) {
    resolve(JSON.parse(data));
  });
});

var resultsFile = new Promise (function (resolve, reject) {
  fs.readFile('../zdroje/volby/ep/2014/vysledky.xml', function(err, data) {
    parser.parseString(data, function (err, json) {
      resolve(json);
    });
  });
});

function fetchPartyDetail (id, o, reg) {

  var item = reg.list.find(party => party.reg === id);

  if (item) {
    if (item.coalition) {
      o.coalition = item.coalition;
    }
  } else {
    console.log("Strana nenalezena: ", id);
  }
}

function fetchPartyReg (id, o, parties) {

  // var party = parties.list.find(party => party.id[0] === id);

  parties.list.forEach(party => {
    if (party.id) {
      if (party.id[0] === id) {
        o.reg = party.reg;
        o.name = party.name;
        o.short = party.short;
      }
    }
  });

  // console.log(party);

  // o.reg = party.reg;
}

Promise.all([partiesFile, resultsFile, cvsFile]).then(function (values) {

  var parties = values[0];
  var result = values[1];
  var cvs = values[2];

  var json = {
    votes: Number(result.VYSLEDKY.CR[0].UCAST[0].$.PLATNE_HLASY),
    voters: Number(result.VYSLEDKY.CR[0].UCAST[0].$.ZAPSANI_VOLICI),
    attended: Number(result.VYSLEDKY.CR[0].UCAST[0].$.VYDANE_OBALKY),
    parties: []
  };

  result.VYSLEDKY.CR[0].STRANA.forEach(function (strana) {

    var strana_o = {
      id: Number(strana.$.ESTRANA),
      reg: 0,
      // name: strana.$.NAZ_STR,
      votes: Number(strana.HLASY_STRANA[0].$.HLASY),
      ptc: Number(strana.HLASY_STRANA[0].$.PROC_HLASU),
      elected: []
    }

    fetchPartyReg(strana_o.id, strana_o, parties);
    fetchPartyDetail(strana_o.reg, strana_o, cvs);

    if (strana.MANDATY_STRANA) {
      strana.MANDATY_STRANA[0].POSLANEC.forEach(function (zastupitel) {
        var zastupitel_o = {
          name: [
            zastupitel.$.TITULPRED,
            zastupitel.$.JMENO,
            zastupitel.$.PRIJMENI,
            zastupitel.$.TITULZA,
          ]
        }

        strana_o.elected.push(zastupitel_o);
      });
    }

    json.parties.push(strana_o);

  });

  writeResults(json);

});
