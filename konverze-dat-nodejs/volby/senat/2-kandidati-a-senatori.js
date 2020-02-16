var fs = require('fs');
const $ = require('cheerio');

var list = [19961116, 19981114, 19990828, 20001112, 20021025, 20031107, 20031031, 20041105, 20041008, 20061020, 20070413, 20070427, 20081017, 20101015, 20110318, 20121012, 20140110, 20140919, 20141010, 20161007, 20170127, 20180105, 20180518, 20181005, 20190405];

const sourceDIR = '../zdroje/volby/senat/';
const targetDIR = '../data/volby/senat/';

function parseName(str) {

  var name = ['', '', '', ''];

  var parts = str.split(' ');

  name[1] = parts[0].split(' ')[0].trim();
  if (parts[0].split(' ')[1]) name[2] = parts[0].split(' ')[1].trim();

  if (parts[1]) {
    var titles = parts[1].split("CSc.");

    name[0] = titles[0].trim();

    if (titles.length > 1) {
      name[3] = 'CSc.';
    }
  }

  return {name};
}

var parties = JSON.parse(fs.readFileSync('../data/obecne/strany.json'));

function getPartyIDByShort (short) {
  var party = parties.list.find(p => (p.short || p.name).toLowerCase() === short.toLowerCase());

  if (party) {
    return party.reg;
  }

  if (short === 'BEZPP') {
    return 99;
  }

  return 80;
}

// create folders

list.forEach(dir => {
  if (!fs.exists(targetDIR + dir)) {
    fs.mkdir(targetDIR + dir, () => {});
  }
});

// process election

list.forEach((dir, i) => {
  setTimeout(() => {
    var htmlKandidati = fs.readFileSync(sourceDIR + dir + '/kandidati.html').toString();
    var listKandidati = [];

    var tr = $('tr', htmlKandidati);

    Object.keys(tr).forEach(key => {
      var td = $('td', tr[key]);

      if (td.length && td.length > 0) {
        var obj = {};
            obj.reg = Number(td[0].children[0].data);
            obj.id = Number(td[1].children[0].data);
            obj.name = parseName(td[2].children[0].data).name;
            obj.age = Number(td[3].children[0].data);
            obj.electionName = td[4].children[0].data;
            obj.nomineeName = td[5].children[0].data;
            obj.memberName = td[6].children[0].data;
            obj.electionAs = getPartyIDByShort(td[4].children[0].data);
            obj.nominee = getPartyIDByShort(td[5].children[0].data);
            obj.member = getPartyIDByShort(td[6].children[0].data);
            obj.work = td[7].children[0].data;
            obj.from = td[8].children[0].data;

        listKandidati.push(obj);
      }
    });

    fs.writeFile(targetDIR + dir + '/kandidati.json', JSON.stringify({
      created: new Date().getTime(),
      list: listKandidati
    }), () => {})

    console.log(dir, 'done');
  }, 1000 * i);
});
