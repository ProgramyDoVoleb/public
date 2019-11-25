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

  if (item.TYPVS[0] === "K") {
    o.coalition = [];

    item.SLOZENI[0].split(",").forEach(c => {
      var c_o = {
        reg: Number(c)
      }

      fetchPartyDetail (Number(c), c_o, reg);

      o.coalition.push(c_o);
    });
  }
}

fs.readFile('../zdroje/obecne/cvs-utf8.xml', function(err, dataReg) {

    bufReg = iconv.encode(dataReg, 'utf8');

    parser.parseString(bufReg, function (err, resultReg) {
        reg = resultReg;
        allParties = [];

        fs.readFile('../zdroje/volby/kv-2016/kzrkl_s.xml', function(err, data) {

            buf = iconv.encode(data, 'utf8');

            parser.parseString(buf, function (err, result) {

              var json = [];

              result.KZ_RKL_SOUHRN.KZ_RKL_SOUHRN_ROW.forEach(function (row) {

                var item = reg.CVS.CVS_ROW.find((item) => Number(item.VSTRANA[0]) === Number(row.VSTRANA[0]));

                if (item.TYPVS[0] === "K") {
                  var partiesInCoalition = item.SLOZENI[0].split(",").map(it => Number(it));

                  partiesInCoalition.forEach(party => {
                    if (allParties.indexOf(party) === -1) allParties.push(party);
                  });
                }

                if (allParties.indexOf(Number(row.VSTRANA[0])) === -1) allParties.push(Number(row.VSTRANA[0]));
              });

              allParties.sort((a, b) => a - b);

              allParties.forEach(party => {

                var item = reg.CVS.CVS_ROW.find((item) => Number(item.VSTRANA[0]) === party);

                var row_o = {
                  // id: Number(row.KSTRANA[0]),
                  reg: party,
                  name: item.NAZEVCELK[0],
                  short: item.ZKRATKAV8[0]
                };

                if (item.TYPVS[0] === "K") {
                  row_o.coalition = item.SLOZENI[0].split(",").map(it => Number(it));
                }

                json.push(row_o);

              });

              fs.writeFile("../data/volby/kv-2016/strany.json", JSON.stringify(json), function(err) {

                  if(err) {
                      return console.log(err);
                  }

                  console.log("The file was saved!");
              });
            });
        });
    });
});
