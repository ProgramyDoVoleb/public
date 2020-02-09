var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var reg = undefined;

function fetchPartyDetail (id, o, reg) {

  var item = reg.CVS.CVS_ROW.find((item) => Number(item.VSTRANA[0]) === id);

  o.name = item.NAZEVCELK[0];
  o.short = item.ZKRATKAV8[0];

  if (item) {
    if (item.TYPVS[0] === "K") {
      o.coalition = item.SLOZENI[0].split(",").map(item => Number(item));
    }
  } else {
    console.log("Strana nenalezena: ", id);
  }
}

fs.readFile('../zdroje/obecne/cvs-utf8.xml', function(err, dataReg) {

    bufReg = iconv.encode(dataReg, 'utf8');

    parser.parseString(bufReg, function (err, resultReg) {
        reg = resultReg;

        fs.readFile('../zdroje/volby/kv/2016/vysledky.xml', function(err, data) {

            buf = iconv.encode(data, 'utf8');

            parser.parseString(buf, function (err, result) {

              var json = [];

              result.VYSLEDKY.KRZAST.forEach(function (krzast) {

                var krzast_o = {
                  name: krzast.$.NAZ_KRZAST,
                  id: Number(krzast.$.CIS_KRZAST),
                  votes: Number(krzast.UCAST[0].$.PLATNE_HLASY),
                  voters: Number(krzast.UCAST[0].$.ZAPSANI_VOLICI),
                  parties: []
                };

                krzast.STRANA.forEach(function (strana) {
                  var strana_o = {
                    id: Number(strana.$.KSTRANA),
                    reg: Number(strana.$.VSTRANA),
                    votes: Number(strana.HODNOTY_STRANA[0].$.HLASY),
                    pct: Number(strana.HODNOTY_STRANA[0].$.PROC_HLASU),
                    elected: []
                  }

                  fetchPartyDetail(strana_o.reg, strana_o, reg);

                  if (strana.ZASTUPITEL) {
                    strana.ZASTUPITEL.forEach(function (zastupitel) {
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

                  krzast_o.parties.push(strana_o);

                });

                json.push(krzast_o);
              });

              fs.writeFile("../data/volby/kv/2016/vysledky.json", JSON.stringify(json), function(err) {

                  if(err) {
                      return console.log(err);
                  }

                  console.log("The file was saved!");
              });
            });
        });
    });
});
