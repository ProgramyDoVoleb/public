var fs = require('fs'),
    util = require('util');

var electionList = [2004, 2009, 2014, 2019];
var electionPath = '../data/volby/ep/';
var electionKey = 'eu';

function writeFile (json, file) {
  fs.writeFile(electionPath + file, JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }

      // console.log("The file was saved!");
  });
}

var lastParties = undefined;
var lastAttendance = undefined;

electionList.forEach(y => {

  console.log(y, !!lastParties);

  // vytvoří adresář v rámci voleb
  if (!fs.existsSync(electionPath + y + '/mapy/')) {
    fs.mkdir(electionPath + y + '/mapy/', err => {
      if (err) throw err;
    });

    fs.mkdir(electionPath + y + '/mapy/strany/', err => {
      if (err) throw err;
    });
  } else {
    if (!fs.existsSync(electionPath + y + '/mapy/strany/')) {
      fs.mkdir(electionPath + y + '/mapy/strany/', err => {
        if (err) throw err;
      });
    }
      if (!fs.existsSync(electionPath + y + '/mapy/obce-podle-okresu/')) {
        fs.mkdir(electionPath + y + '/mapy/obce-podle-okresu/', err => {
          if (err) throw err;
        });
      }
  }

  var partyList = JSON.parse(fs.readFileSync(electionPath + y + '/strany.json'));
  var parties = [];
  var attendance = {
    towns: [],
    districts: [],
    regions: []
  };
  var best5 = {
    towns: [],
    districts: [],
    regions: []
  }

  partyList.list.forEach(party => {
    parties.push({reg: party.reg, towns: [], districts: [], regions: []});
  })

  fs.readdirSync('../data/souhrny/obce/').forEach(dir => {
    fs.readdirSync('../data/souhrny/obce/' + dir + '/').forEach(file => {
      var town = JSON.parse(fs.readFileSync('../data/souhrny/obce/' + dir + '/' + file));

      if (town && town.volby && town.volby[electionKey]) {
        var el = town.volby[electionKey].find(e => e.year === y);

        if (el) {
          var obj = {
            num: town.id,
            pct: el.stats.pct
          }

          if (lastAttendance) {
            var last = lastAttendance.towns.find(r => r[0] === obj.num);

            if (last) {
              obj.diff = Math.round((obj.pct - last[1]) * 100) / 100;
              obj.last = last[1];
            } else {
              obj.diff = 0;
              obj.last = obj.pct
            }

            attendance.towns.push([obj.num, obj.pct, obj.last, obj.diff]);
          } else {
            attendance.towns.push([obj.num, obj.pct]);
          }

          el.result.forEach(result => {
            var party = parties.find(p => p.reg === result.reg);

            if (party) {

              var res = {
                num: town.id,
                pct: result.pct
              };

              if (lastParties) {
                var partyLast = lastParties.find(p => p.reg === party.reg);

                if (partyLast) {
                  var partyLastRegion = partyLast.towns.find(r => r[0] === res.num);

                  if (partyLastRegion) {
                    res.last = partyLastRegion[1];
                    res.diff = Math.round((res.pct - partyLastRegion[1]) * 100) / 100;
                  }
                }
              }

              if (res.last) {
                party.towns.push([res.num, res.pct, res.last, res.diff]);
              } else {
                party.towns.push([res.num, res.pct]);
              }
            }
          });

          // FIND BEST 5 IN TOWN

          el.result.sort((a, b) => b.pct - a.pct);

          var best = {
            num: town.id,
            list: []
          }

          for (var i = 0; i < 5; i++) {
            if (el.result[i]) {
              var p = {
                reg: el.result[i].reg,
                pct: el.result[i].pct
              }

              best.list.push([p.reg, p.pct]);
            }
          }

          best5.towns.push([best.num, best.list]);
        }
      }
    });
  });

  var districts = JSON.parse(fs.readFileSync('../data/souhrny/okresy/' + electionKey + '/' + y + '/souhrn.json'));

  if (districts) {
    districts.list.forEach(district => {

      if (district.results) {
        var obj = {
          nuts: district.nuts,
          pct: Math.round(district.results.stats.votes / district.results.stats.voters * 10000) / 100
        }

        if (lastAttendance) {
          var last = lastAttendance.districts.find(r => r[0] === obj.nuts);

          if (last) {
            obj.diff = Math.round((obj.pct - last[1]) * 100) / 100;
            obj.last = last[1];
          } else {
            obj.diff = 0;
            obj.last = obj.pct
          }

          attendance.districts.push([obj.nuts, obj.pct, obj.last, obj.diff]);
        } else {
          attendance.districts.push([obj.nuts, obj.pct]);
        }

        district.results.result.forEach(result => {
          var party = parties.find(p => p.reg === result.reg);

          if (party) {

            var res = {
              nuts: district.nuts,
              pct: result.pct
            };

            if (lastParties) {
              var partyLast = lastParties.find(p => p.reg === party.reg);

              if (partyLast) {
                var partyLastRegion = partyLast.districts.find(r => r[0] === res.nuts);

                if (partyLastRegion) {
                  res.last = partyLastRegion[1];
                  res.diff = Math.round((res.pct - partyLastRegion[1]) * 100) / 100;
                }
              }
            }

            if (res.last) {
              party.districts.push([res.nuts, res.pct, res.last, res.diff]);
            } else {
              party.districts.push([res.nuts, res.pct]);
            }
          }
        });

        // FIND BEST 5 IN TOWN

        district.results.result.sort((a, b) => b.pct - a.pct);

        var best = {
          num: district.nuts,
          list: []
        }

        for (var i = 0; i < 5; i++) {
          if (district.results.result[i]) {
            var p = {
              reg: district.results.result[i].reg,
              pct: district.results.result[i].pct
            }

            best.list.push([p.reg, p.pct]);
          }
        }

        best5.districts.push([best.num, best.list]);
      }
    });
  }

  var regions = JSON.parse(fs.readFileSync('../data/souhrny/kraje/' + electionKey + '/' + y + '/souhrn.json'));

  if (regions) {
    regions.list.forEach(region => {

      if (region.results) {
        var obj = {
          nuts: region.nuts,
          pct: Math.round(region.results.stats.votes / region.results.stats.voters * 10000) / 100
        }

        if (lastAttendance) {
          var last = lastAttendance.regions.find(r => r[0] === obj.nuts);

          if (last) {
            obj.diff = Math.round((obj.pct - last[1]) * 100) / 100;
            obj.last = last[1];
          } else {
            obj.diff = 0;
            obj.last = obj.pct
          }

          attendance.regions.push([obj.nuts, obj.pct, obj.last, obj.diff]);
        } else {
          attendance.regions.push([obj.nuts, obj.pct]);
        }

        region.results.result.forEach(result => {
          var party = parties.find(p => p.reg === result.reg);

          if (party) {

            var res = {
              nuts: region.nuts,
              pct: result.pct
            };

            if (lastParties) {
              var partyLast = lastParties.find(p => p.reg === party.reg);

              if (partyLast) {
                var partyLastRegion = partyLast.regions.find(r => r[0] === res.nuts);

                if (partyLastRegion) {
                  res.last = partyLastRegion[1];
                  res.diff = Math.round((res.pct - partyLastRegion[1]) * 100) / 100;
                }
              }
            }

            if (res.last) {
              party.regions.push([res.nuts, res.pct, res.last, res.diff]);
            } else {
              party.regions.push([res.nuts, res.pct]);
            }
          }
        });

        // FIND BEST 5 IN TOWN

        region.results.result.sort((a, b) => b.pct - a.pct);

        var best = {
          num: region.nuts,
          list: []
        }

        for (var i = 0; i < 5; i++) {
          if (region.results.result[i]) {
            var p = {
              reg: region.results.result[i].reg,
              pct: region.results.result[i].pct
            }

            best.list.push([p.reg, p.pct]);
          }
        }

        best5.regions.push([best.num, best.list]);
      }
    });
  }

  writeFile(attendance, y + '/mapy/ucast.json');
  writeFile(attendance.towns, y + '/mapy/ucast-obce.json');
  writeFile(attendance.districts, y + '/mapy/ucast-okresy.json');
  writeFile(attendance.regions, y + '/mapy/ucast-kraje.json');

  writeFile(best5, y + '/mapy/nej5.json');
  writeFile(best5.towns, y + '/mapy/nej5-obce.json');
  writeFile(best5.districts, y + '/mapy/nej5-okresy.json');
  writeFile(best5.regions, y + '/mapy/nej5-kraje.json');

  parties.forEach(party => {
    writeFile(party, y + '/mapy/strany/' + party.reg + '.json');
    writeFile(party.towns, y + '/mapy/strany/' + party.reg + '-obce.json');
    writeFile(party.districts, y + '/mapy/strany/' + party.reg + '-okresy.json');
    writeFile(party.regions, y + '/mapy/strany/' + party.reg + '-kraje.json');
  });

  lastParties = parties;
  lastAttendance = attendance;

})
