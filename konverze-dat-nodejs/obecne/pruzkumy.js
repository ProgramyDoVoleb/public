var fs = require('fs');

var list = JSON.parse(fs.readFileSync('zdroje/pruzkumy/pop.json'));

var enumero = {
  ANO: {hash: "768-ano", reg: 768},
  CSSD: {hash: "7-cssd", reg: 7},
  KDU: {hash: "1-kdu-csl", reg: 1},
  KSCM: {hash: "47-kscm", reg: 47},
  ODS: {hash: "53-ods", reg: 53},
  "ODScoal": {hash: "spolu-ods-kducsl-top09", reg: -1},
  PIRATI: {hash: "720-pirati", reg: 720},
  SPD: {hash: "1114-spd", reg: 1114},
  STAN: {hash: "166-stan", reg: 166},
  SVOBODNI: {reg: 714},
  THO: {hash: "1227-trikolora", reg: 1227},
  "TOP09": {hash: "721-top-09", reg: 721},
  ZELENI: {reg: 5}
};

var parties = [];
var agencies = [];

function newParty(key) {
  var obj = {
    reg: -1,
    key: key,
    hash: undefined,
    polls: []
  }

  var item = enumero[key];

  if (item) {
    obj.reg = item.reg;
    obj.hash = item.hash;
  }

  parties.push(obj);

  return obj;
}

function addPoll(poll, key) {
  var party = parties.find(x => x.key === key);

  if (!party) {
    party = newParty(key);
  }

  party.polls.push({
    date: poll.date,
    value: poll.parties[key],
    agency: poll.firm.toUpperCase(),
  });

  var agency = agencies.find(x => x.key === poll.firm.toUpperCase())

  if (!agency) {
    agency = {key: poll.firm.toUpperCase(), name: "", links: [], polls: []}
    agencies.push(agency);
  }

  if (!agency.polls.find(x => x.date === poll.date)) agency.polls.push({date: poll.date})
}

list.polls.forEach(poll => {
  if (Number(poll.date.split('-')[0]) > 2016) {
    Object.keys(poll.parties).forEach(party => {
      addPoll(poll, party);
    });
  }
})

var partylist = [];

parties.forEach(party => {

  party.polls.sort((a, b) => b.date.localeCompare(a.date, 'en'));

  fs.writeFileSync('data/pruzkumy/strany/' + (party.hash || party.key) + '.json', JSON.stringify(party, null, 2));

  partylist.push(party.hash || party.key);
});

fs.writeFileSync('data/pruzkumy/prehled.json', JSON.stringify(partylist, null, 2));
fs.writeFileSync('data/pruzkumy/agentury.json', JSON.stringify(agencies, null, 2));
