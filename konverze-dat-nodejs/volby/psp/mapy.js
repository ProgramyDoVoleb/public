var fs = require('fs'),
    util = require('util');

var electionList = [2006, 2010, 2013, 2017];
var electionPath = '../data/volby/psp/';
var electionKey = 'snemovna';

function getSize (size) {
  if (size < 250) {
    return 0
  } else if (size < 1000) {
    return 1
  } else if (size < 2500) {
    return 2
  } else if (size < 10000) {
    return 3
  } else if (size < 25000) {
    return 4
  } else if (size < 100000) {
    return 5
  } else if (size < 1000000){
    return 6
  } else {
    return 7
  }
}

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

  var partyList = JSON.parse(fs.readFileSync(electionPath + y + '/strany.json'));
  var parties = [];
  var attendance = {
    towns: [],
    districts: [],
    regions: [],
    tir: {},
    tid: {}
  };
  var best5 = {
    towns: [],
    districts: [],
    regions: [],
    tir: {},
    tid: {}
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

          var tir = {
            attendance: undefined,
            best5: undefined
          }

          var tid = {
            attendance: undefined,
            best5: undefined
          }

          var obj = {
            num: [town.id, (town.hierarchy || {gps: {lng: 0}}).gps.lng, (town.hierarchy || {gps: {lnt: 0}}).gps.lnt, getSize(((town.stats || {population: [{value: 0}]}).population[(town.stats || {population: [{value: 0}]}).population.length - 1] || {value: 0}).value)],
            pct: el.stats.pct
          }

          if (town.hierarchy && town.hierarchy.kraj && town.hierarchy.kraj.nuts) {
            if (!attendance.tir[town.hierarchy.kraj.nuts]) attendance.tir[town.hierarchy.kraj.nuts] = [];
            if (!best5.tir[town.hierarchy.kraj.nuts]) best5.tir[town.hierarchy.kraj.nuts] = [];

            tir.attendance = attendance.tir[town.hierarchy.kraj.nuts];
            tir.best5 = best5.tir[town.hierarchy.kraj.nuts];
          } else {
            tir.attendance = [];
            tir.best5 = [];
          }

          if (town.hierarchy && town.hierarchy.okres && town.hierarchy.okres.nuts) {
            if (!attendance.tid[town.hierarchy.okres.nuts]) attendance.tid[town.hierarchy.okres.nuts] = [];
            if (!best5.tid[town.hierarchy.okres.nuts]) best5.tid[town.hierarchy.okres.nuts] = [];

            tid.attendance = attendance.tid[town.hierarchy.okres.nuts];
            tid.best5 = best5.tid[town.hierarchy.okres.nuts];
          } else {
            tid.attendance = [];
            tid.best5 = [];
          }

          if (lastAttendance) {
            var last = lastAttendance.towns.find(r => r[0][0] === obj.num[0]);

            if (last) {
              obj.diff = Math.round((obj.pct - last[1]) * 100) / 100;
              obj.last = last[1];
            } else {
              obj.diff = 0;
              obj.last = 0;
            }

            attendance.towns.push([obj.num, obj.pct, obj.last, obj.diff]);
            tir.attendance.push([obj.num, obj.pct, obj.last, obj.diff]);
            tid.attendance.push([obj.num, obj.pct, obj.last, obj.diff]);
          } else {
            attendance.towns.push([obj.num, obj.pct]);
            tir.attendance.push([obj.num, obj.pct]);
            tid.attendance.push([obj.num, obj.pct]);
          }

          el.result.forEach(result => {
            var party = parties.find(p => p.reg === result.reg);

            if (party) {

              var res = {
                num: [town.id, (town.hierarchy || {gps: {lng: 0}}).gps.lng, (town.hierarchy || {gps: {lnt: 0}}).gps.lnt, getSize(((town.stats || {population: [{value: 0}]}).population[(town.stats || {population: [{value: 0}]}).population.length - 1] || {value: 0}).value)],
                pct: result.pct
              };

              if (lastParties) {
                var partyLast = lastParties.find(p => p.reg === party.reg);

                if (partyLast) {
                  var partyLastRegion = partyLast.towns.find(r => r[0][0] === res.num[0]);

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
            num: [town.id, (town.hierarchy || {gps: {lng: 0}}).gps.lng, (town.hierarchy || {gps: {lnt: 0}}).gps.lnt, getSize(((town.stats || {population: [{value: 0}]}).population[(town.stats || {population: [{value: 0}]}).population.length - 1] || {value: 0}).value)],
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
          tir.best5.push([best.num, best.list]);
          tid.best5.push([best.num, best.list]);
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
            obj.last = 0;
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
            obj.last = 0;
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

  writeFile(attendance.towns, y + '/mapy/ucast-obce.json');
  writeFile(attendance.districts, y + '/mapy/ucast-okresy.json');
  writeFile(attendance.regions, y + '/mapy/ucast-kraje.json');

  writeFile(best5.towns, y + '/mapy/nej5-obce.json');
  writeFile(best5.districts, y + '/mapy/nej5-okresy.json');
  writeFile(best5.regions, y + '/mapy/nej5-kraje.json');

  Object.keys(attendance.tir).forEach(key => {
    writeFile(attendance.tir[key], y + '/mapy/ucast/obce-podle-kraje/' + key + '.json');
  });

  Object.keys(attendance.tid).forEach(key => {
    writeFile(attendance.tid[key], y + '/mapy/ucast/obce-podle-okresu/' + key + '.json');
  });

  Object.keys(best5.tir).forEach(key => {
    writeFile(best5.tir[key], y + '/mapy/nej5/obce-podle-kraje/' + key + '.json');
  });

  Object.keys(best5.tid).forEach(key => {
    writeFile(best5.tid[key], y + '/mapy/nej5/obce-podle-okresu/' + key + '.json');
  });

  parties.forEach(party => {
    writeFile(party, y + '/mapy/strany/' + party.reg + '.json');
    writeFile(party.towns, y + '/mapy/strany/' + party.reg + '-obce.json');
    writeFile(party.districts, y + '/mapy/strany/' + party.reg + '-okresy.json');
    writeFile(party.regions, y + '/mapy/strany/' + party.reg + '-kraje.json');
  });

  lastParties = parties;
  lastAttendance = attendance;

})
