const fs = require('fs');
const util = require('util')

function writeJSON (json, file) {
  fs.writeFile(file, JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }
  });
}

var main = JSON.parse(fs.readFileSync("../data/obecne/strany.json"));
var elec = JSON.parse(fs.readFileSync("../data/obecne/seznam-voleb.json")).list;

var highlightedTowns = [554782, 582786, 569810, 586846, 554961, 563889, 500496, 554821, 555134, 554791, 554804, 585068];

var parties = main.list;

// TEST
// parties = [parties.find(p => p.reg === 721)];

parties.forEach(party => {
  party.activity = {
    last: 0,
    list: []
  }
});

elec.forEach(type => {
  if (['snemovni-volby', 'evropske-volby'].indexOf(type.hash) > -1) {
    type.list.forEach(el => {
      var results = JSON.parse(fs.readFileSync("../" + el.path + "/vysledky.json")).parties;

      results.forEach(result => {
        var party = parties.find(p => p.reg === result.reg);

        if (party) {

          var affect = [party];

          if (party.coalition) {
            party.coalition.forEach(coal => {
              var member = parties.find(p => p.reg === coal);

              if (member) {
                affect.push(member);
              }
            });
          }

          affect.forEach(affected => {
            if (el.date[0] > affected.activity.last) affected.activity.last = el.date[0];

            affected.activity.list.push({
              type: type.hash,
              id: el.id,
              date: el.date[0],
              reg: party.reg,
              name: affected.reg != party.reg ? party.name : undefined,
              coalition: party.reg != affected.reg ? party.coalition : undefined,
              pct: result.pct || result.ptc,
              elected: result.elected.length
            });
          });
        }
      });
    });
  }

  if (['krajske-volby'].indexOf(type.hash) > -1) {
    type.list.forEach(el => {
      var results = JSON.parse(fs.readFileSync("../" + el.path + "/vysledky.json"));
      results.forEach(area => {
        area.parties.forEach(result => {
          var party = parties.find(p => p.reg === result.reg);

          if (party) {

            var affect = [party];

            if (party.coalition) {
              party.coalition.forEach(coal => {
                var member = parties.find(p => p.reg === coal);

                if (member) {
                  affect.push(member);
                }
              });
            }

            affect.forEach(affected => {
              if (el.date[0] > affected.activity.last) affected.activity.last = el.date[0];

              var data = affected.activity.list.find(d => d.type === type.hash && d.id === el.id);

              if (!data) {
                data = {
                  type: type.hash,
                  id: el.id,
                  date: el.date[0],
                  list: []
                }

                affected.activity.list.push(data);
              }

              data.list.push({
                area: area.id,
                reg: party.reg,
                name: affected.reg != party.reg ? party.name : undefined,
                coalition: party.reg != affected.reg ? party.coalition : undefined,
                pct: result.pct,
                elected: result.elected.length
              });
            });
          }
        });
      });
    });
  }

  if (['prezidentske-volby'].indexOf(type.hash) > -1) {
    type.list.forEach(el => {
      var results = JSON.parse(fs.readFileSync("../" + el.path + "/vysledky.json"));
      var candidates = JSON.parse(fs.readFileSync("../" + el.path + "/kandidati.json")).list;

      candidates.forEach(candidate => {
        var obj = {
          name: candidate.name,
          member: candidate.member,
          nominee: candidate.nominee,
          elected: false
        }

        if (results.round1) {
          var res = results.round1.candidates.find(c => c.id === candidate.id);

          if (res) {
            obj.round1 = {
              pct: res.pct,
              progress: res.progress
            }

            if (obj.progress === true && !results.round2) {
              obj.elected = true;
            }
          }
        }

        if (results.round2) {
          var res = results.round2.candidates.find(c => c.id === candidate.id);

          if (res) {
            obj.round2 = {
              pct: res.pct,
              progress: res.progress
            }

            if (obj.round2.progress === true) {
              obj.elected = true;
            }
          }
        }

        var party = parties.find(p => p.reg === obj.member);

        if (!party) {
          party = parties.find(p => p.reg === obj.nominee);
        }

        if (party) {

          var affect = [party];

          if (party.coalition) {
            party.coalition.forEach(coal => {
              var member = parties.find(p => p.reg === coal);

              if (member) {
                affect.push(member);
              }
            });
          }

          affect.forEach(affected => {
            if (el.date[0] > affected.activity.last) affected.activity.last = el.date[0];

            var data = {
              type: type.hash,
              id: el.id,
              date: el.date[0],
              reg: obj.member,
              nominee: obj.nominee,
              candidate: obj.name,
              name: obj.member != party.reg ? party.name : undefined,
              coalition: party.reg != affected.reg ? party.coalition : undefined,
              elected: obj.elected,
              round1: obj.round1,
              round2: obj.round2
            }

            affected.activity.list.push(data);
          });
        }
      });
    });
  }

  if (['senatni-volby'].indexOf(type.hash) > -1) {
    type.list.forEach(el => {
      try {
      var resultsAll = JSON.parse(fs.readFileSync("../" + el.path + "/vysledky.json"));
      var candidatesAll = JSON.parse(fs.readFileSync("../" + el.path + "/kandidati.json")).list;

      resultsAll.areas.forEach(results => {
        var candidates = [];

        results.round1.candidates.forEach(cand => {
          candidates.push(candidatesAll.find(c => c.id === cand.id && c.reg === results.id));
        });

        candidates.forEach(candidate => {
          var obj = {
            name: candidate.name,
            member: candidate.member,
            nominee: candidate.nominee || candidate.nominee,
            elected: false
          }

          if (results.round1) {
            var res = results.round1.candidates.find(c => c.id === candidate.id);

            if (res) {
              obj.round1 = {
                pct: res.pct,
                progress: res.progress
              }

              if (obj.progress === true && !results.round2) {
                obj.elected = true;
              }
            }
          }

          if (results.round2) {
            var res = results.round2.candidates.find(c => c.id === candidate.id);

            if (res) {
              obj.round2 = {
                pct: res.pct,
                progress: res.progress
              }

              if (obj.round2.progress === true) {
                obj.elected = true;
              }
            }
          }

          var party = parties.find(p => p.reg === obj.member);

          if (!party) {
            party = parties.find(p => p.reg === obj.nominee);
          }

          if (party) {

            var affect = [party];

            if (party.coalition) {
              party.coalition.forEach(coal => {
                var member = parties.find(p => p.reg === coal);

                if (member) {
                  affect.push(member);
                }
              });
            }

            affect.forEach(affected => {
              if (el.date[0] > affected.activity.last) affected.activity.last = el.date[0];

              var data = affected.activity.list.find(d => d.type === type.hash && d.id === el.id);

              if (!data) {
                data = {
                  type: type.hash,
                  id: el.id,
                  date: el.date[0],
                  list: []
                }

                affected.activity.list.push(data);
              }

              data.list.push({
                area: candidate.reg,
                reg: obj.member,
                nominee: obj.nominee,
                candidate: obj.name,
                name: obj.member != party.reg ? party.name : undefined,
                coalition: party.reg != affected.reg ? party.coalition : undefined,
                elected: obj.elected,
                round1: obj.round1,
                round2: obj.round2
              })
            });
          }
        });
      });
    } catch (e) {
      console.log("Neznámé volby", type.hash, el.label)
    }
    });
  }

  if (['komunalni-volby'].indexOf(type.hash) > -1) {
    type.list.forEach(el => {
      var districts = JSON.parse(fs.readFileSync("../" + el.path + "/vysledky.json")).list;

      districts.forEach(district => {

        district.list.forEach(town => {

          town.parties.forEach(result => {

            var party = parties.find(p => p.reg === result.reg);

            if (party) {

              var affect = [party];

              if (party.coalition) {
                party.coalition.forEach(coal => {
                  var member = parties.find(p => p.reg === coal);

                  if (member) {
                    affect.push(member);
                  }
                });
              }

              affect.forEach(affected => {
                if (el.date[0] > affected.activity.last) affected.activity.last = el.date[0];

                var data = affected.activity.list.find(d => d.type === type.hash && d.id === el.id);

                if (!data) {
                  data = {
                    type: type.hash,
                    id: el.id,
                    date: el.date[0],
                    count: {
                      self: 0,
                      coalition: 0
                    },
                    coalitions: [],
                    list: [],
                    top10: [],
                    elected: 0
                  }

                  affected.activity.list.push(data);
                }

                if (party.reg != affected.reg) {
                  data.count.coalition++;
                  data.coalitions.push(party.reg);
                } else {
                  data.count.self++;
                }

                data.elected += result.seats

                var item = {
                  num: town.id,
                  townName: town.name,
                  reg: party.reg,
                  name: affected.reg != party.reg ? party.name : undefined,
                  coalition: party.reg != affected.reg ? party.coalition : undefined,
                  pct: result.pct || result.pct,
                  elected: result.seats
                };

                if (highlightedTowns.indexOf(town.id) > -1) {
                  data.list.push(item);
                }

                data.top10.push(item);
              });
            }
          });
        });
      });

      parties.forEach(party => {
        var kv = party.activity.list.find(v => v.type === type.hash && v.id === el.id);

        if (kv) {
          kv.top10.sort((a, b) => b.pct - a.pct);
          kv.top10.splice(10);
        }
      });

    });
  }
});

parties.forEach(party => {
  party.activity.list.sort((a, b) => b.date - a.date);
});

parties.forEach(party => {

  var file = "../data/obecne/strany/data/" + party.reg + "-" + party.hash + ".json";

  try {
    o = JSON.parse(fs.readFileSync(file));

    o.activity = party.activity;

    writeJSON(o, file);

    o.activity.list = undefined;

  } catch (e) {
    console.log(e);
  }
});

writeJSON(main, "../data/obecne/strany.json");

var check = parties.find(p => p.reg === 53);

// console.log(util.inspect(check, false, null, true /* enable colors */));
