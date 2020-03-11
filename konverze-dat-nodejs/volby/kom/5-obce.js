var fs = require('fs');
const $ = require('cheerio');

const target = '../../data/souhrny/obce/';
const dir = '../../zdroje/volby/kom/';

var list = JSON.parse(fs.readFileSync(dir + 'linksToFetch-4.json'));
var townsListFile = JSON.parse(fs.readFileSync('../../data/obecne/obce-flat.json'));
var parties = JSON.parse(fs.readFileSync('../../data/obecne/strany.json'));

var townsList = [];

Object.keys(townsListFile.list).forEach(region => {
  townsListFile.list[region].forEach(town => {
    townsList.push([
      town[0],
      region
    ]);
  });
});

function getPartyIDByShort (short, date) {
  var party = parties.list.find(p => (p.short || p.name).toLowerCase() === short.toLowerCase());

  if (party) {
    if (party.reg === 120 && date > 20100000) {
      return 768;
    } else {
      return party.reg;
    }
  } else {
    return 90;
  }
}

function processName (str) {

  var parts = str.split(' ');

  if (parts.length === 1) parts = str.split(' ');

  return [parts.length > 2 ? parts[2] : '', parts[1], parts[0], ''];
}

function processTownOld (json, results, people) {
  var date = $('.pismo4', results)[0].children[0].data.split('obcí ')[1].split('.');
      date[2] = date[2].split('\n')[0]

  var label = Number(date[2] + date[1] + date[0]);
  var ex = json.find(x => (x.id || x.year) === label);

  if (ex) {
    json.splice(json.indexOf(ex), 1);
  }

  // STATS

  var statsHTML = $('.pismo1 + br + br + table tr:nth-child(3) td', results);

  var stats = {
    voters: Number(statsHTML[5].children[0].data.split(' ').join('')),
    pct: Number(statsHTML[7].children[0].data.split(',').join('.'))
  }

  // RESULTS

  var res = [];

  var resHTML = $('table ~ table tr + tr + tr', results);

  for (var i = 0; i < resHTML.length; i++) {
    var lineHTML = $('td', resHTML[i]);

    var reso = {
      id:    0,
      votes: Number(lineHTML[2].children[0].data.split(' ').join('')),
      pct:   Number(lineHTML[3].children[0].data.split(',').join('.')),
      reg:   0,
      name:  lineHTML[1].children[0].data,
      list: []
    }

    if (lineHTML[0].children[0].children) {
      reso.id = Number(lineHTML[0].children[0].children[0].data)
    } else {
      reso.id = Number(lineHTML[0].children[0].data)
    }

    reso.reg = getPartyIDByShort(reso.name);

    res.push(reso);
  }

  // PEOPLE

  var ppl = [];

  var pplHTML = $('table tr + tr + tr', people);

  for (var i = 0; i < pplHTML.length; i++) {
    var lineHTML = $('td', pplHTML[i]);

    var hum = {
      num:    Number(lineHTML[0].children[0].data),
      name:   processName(lineHTML[3].children[0].data)
    }

    ppl.push(hum);

    res.find(r => r.id === hum.num).list.push(hum);
  }

  // OBJ

  var obj = {
    id: label,
    stats,
    parts: [{
      stats,
      results: res
    }]
  };

  json.push(obj);
}

function processTownNew (json, results, people, townID) {
  var date = $('h1', results)[0].children[0].data.split('obcí ')[1].split('.');
      date[2] = date[2].split('\n')[0]

  var label = Number(date[2] + date[1] + date[0]);
  var ex = json.find(x => (x.id || x.year) === label);

  if (ex) {
    json.splice(json.indexOf(ex), 1);
  }

  // STATS

  var statsHTML = $('h3 + table tr:nth-child(3) td', results);

  if (statsHTML.length === 0) {
    statsHTML = $('h3 + h4 + table tr:nth-child(3) td', results);
  }

  var stats = {
    voters: Number(statsHTML[5].children[0].data.split(' ').join('')),
    pct: Number(statsHTML[7].children[0].data.split(',').join('.'))
  }

  // RESULTS

  var res = [];

  var resHTML = $('table ~ table tr + tr + tr', results);

  for (var i = 0; i < resHTML.length; i++) {
    var lineHTML = $('td', resHTML[i]);

    var reso = {
      id:    0,
      votes: Number(lineHTML[2].children[0].data.split(' ').join('')),
      pct:   Number(lineHTML[3].children[0].data.split(',').join('.') ),
      reg:   0,
      name:  lineHTML[1].children[0].data,
      list: []
    }

    reso.reg = getPartyIDByShort(reso.name);

    if (lineHTML[0].children[0].children) {
      reso.id = Number(lineHTML[0].children[0].children[0].data)
    } else {
      reso.id = Number(lineHTML[0].children[0].data)
    }

    res.push(reso);
  }

  // PEOPLE

  var ppl = [];

  var pplHTML = $('table tr + tr + tr', people);

  for (var i = 0; i < pplHTML.length; i++) {
    var lineHTML = $('td', pplHTML[i]);

    var hum = {
      num:    Number(lineHTML[0].children[0].data),
      name:   processName(lineHTML[3].children[0].data)
    }

    ppl.push(hum);

    res.find(r => r.id === hum.num).list.push(hum);
  }

  // OBJ

  var obj = {
    id: label,
    stats,
    parts: [{
      stats,
      results: res
    }]
  };

  json.push(obj);
}

list.forEach((link, i) => {

  // if (i > 5) return;

  var spl = link.split('/');
  var params = spl[1].split('-');
  var townID = Number(params[1]);

  var town = townsList.find(t => t[0] === townID);

  if (town) {

    var file = target + town[1] + '/' + town[0] + '.json';

    if (fs.existsSync(file)) {
      var json = JSON.parse(fs.readFileSync(file));
      var results = fs.readFileSync(dir + link + '-vysledky.html').toString();
      var people = fs.readFileSync(dir + link + '-mandaty.html').toString();

      console.log(spl[0], town[1], town[0], 'process');

      if (spl[0] === 'kv1998' || spl[0] === 'kv2002') {
        processTownOld(json.volby.obce, results, people, townID);
      } else {
        processTownNew(json.volby.obce, results, people, townID);
      }

      fs.writeFileSync(file, JSON.stringify(json));

      // console.log(town[1], town[0], 'saved');
    } else {
      console.log(townID, 'not in this region (' + town[1] + ') -› skip');
    }
  } else {
    console.log(townID, 'unknown');
  }
});
