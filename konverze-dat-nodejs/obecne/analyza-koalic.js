var fs = require('fs');

function writeJSON (json, file) {
  fs.writeFile(file, JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }
  });
}

var main = JSON.parse(fs.readFileSync("../data/obecne/strany.json"));

var parties = main.list;

parties.forEach(party => {
  party.memberOfCoalition = [];
  party.memberOf = [];
  party.usualCoalitionWith = [];
});

parties.forEach(party => {
  if (party.coalition) {
    party.coalition.forEach(reg => {
      var member = parties.find(p => p.reg === reg);

      if (member) {
        member.memberOfCoalition.push(party);
        member.memberOf.push(party.reg);
      }
    });
  }
});

parties.forEach(party => {
  party.memberOfCoalition.forEach(coalition => {
    coalition.coalition.forEach(member => {
      if (member != party.reg) {
        var stat = party.usualCoalitionWith.find(p => p.reg === member);

        if (!stat) {
          stat = {
            count: 0,
            reg: member
          }

          party.usualCoalitionWith.push(stat);
        }

        stat.count++;
      }
    });
  });

  party.usualCoalitionWith.sort((a, b) => b.count - a.count);
});

parties.forEach(party => {

  var file = "../data/obecne/strany/data/" + party.reg + "-" + party.hash + ".json";

  try {
    o = JSON.parse(fs.readFileSync(file));

    o.memberOf = party.memberOf;
    o.memberOfCoalition = undefined;
    o.usualCoalitionWith = party.usualCoalitionWith;

    writeJSON(o, file);

  } catch (e) {
    console.log(e);
  }
});

parties.forEach(party => {
  party.memberOfCoalition = undefined;
  party.usualCoalitionWith = undefined;
});

writeJSON(main, "../data/obecne/strany.json");
