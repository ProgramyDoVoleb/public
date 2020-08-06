var fs = require('fs');

function betterURL (url) {
  var newURL = url;

  var repl = [[' ', '-'],['.', '-'],[',', '-'],['–', '-'],['?', ''],['!', ''],['(', ''],[')', ''],['á', 'a'],['č', 'c'],['ď', 'd'],['é', 'e'],['ě', 'e'],['í', 'i'],['ľ', 'l'],['ň', 'n'],['ó', 'o'],['ř', 'r'],['š', 's'],['ť', 't'],['ú', 'u'],['ů', 'u'],['ý', 'y'],['ž', 'z']];

  newURL = newURL.toLowerCase();

  repl.forEach(r => newURL = newURL.split(r[0]).join(r[1]));

  return newURL;
}

var regionIDList = ['stk', 'jck', 'plk', 'kvk', 'ulk', 'lbk', 'khk', 'pak', 'vys', 'jmk', 'olk', 'zlk', 'msk']

var election = JSON.parse(fs.readFileSync('./data/volby/kv/2020/list.json'));

var partyList = JSON.parse(fs.readFileSync('./data/volby/kv/2020/strany.json'));

election.list.forEach((region, regionID) => {
  region.parties.forEach(party => {
    var dataSource = party.data;

    if (!dataSource) {
      if (party.reg) {
        dataSource = regionIDList[regionID] + '/' + party.reg;
      } else if (party.name) {
        dataSource = regionIDList[regionID] + '/' + betterURL(party.name);
      } else if (party.coalition) {
        var name = [];

        party.coalition.forEach(member => {
          if (typeof member === 'number') name.push(member);
          if (typeof member === 'string') name.push(betterURL(member));
          if (typeof member === 'object') name.push(betterURL(member.name));
        })

        dataSource = regionIDList[regionID] + '/' + name.join('-');
      }
    }

    var link = './data/volby/kv/2020/data/' + dataSource + '.json';

    var data = {};

    if (fs.existsSync(link)) {
      data = JSON.parse(fs.readFileSync(link))
    } else {
      data = {}
    }

    // DO STUFF

    data.reg = party.reg;

    var partydata = {};
    if (data.reg) partydata = partyList.list.find(x => x.reg === data.reg) || {}

    data.coalition = party.coalition || partydata.coalition;
    data.support = party.support;

    data.logo = party.logo || partydata.logo;
    data.color = party.color || (partydata.color || '#aaa');
    data.name = party.name || partydata.name;
    data.short = party.short || partydata.short;

    if (data.color === '#aaa' && data.coalition) {
      var x = partyList.list.find(x => x.reg === data.coalition[0])

      if (x && x.color) {
        data.color = x.color;
      }
    }

    data.hash = party.hash || partydata.hash;

    if (!data.program) data.program = {};
    if (!data.people) data.people = [];

    if (party.motto) data.program.motto = party.motto;
    if (party.program) data.program.source = party.program;

    data.copyright = party.copyright;
    data.lastUpdate = new Date();
    data.data = dataSource;

    if (party.links) {
      data.links = [];

      party.links.forEach(link => {
        if (typeof link === 'string') data.links.push(link);
        if (typeof link === 'object') data.links.push(link.url);
      })
    }

    if (party.leader) {
      if (!party.list) party.list = [];

      party.list.unshift(party.leader);
    }

    if (party.list) {
      data.list = [];

      party.list.forEach(person => {
        var o = {
          nameFull: ['', '', '', ''], sex: 0
        }

        var name = person.name || person;
        var reg = person.reg;
        var phash = person.phash;

        if (reg) o.reg = reg;
        if (phash) o.phash = phash;

        if (party.reg && !o.reg) o.reg = party.reg;

        var core;

        if (name.split(' ').length != 2) {
          var a = name.split(', ');
          var b = a.shift();

          if (a.length > 0) o.nameFull[3] = a.join(' ');

          var c = b.split('. ');

          core = c.pop();

          if (c.length > 0) o.nameFull[0] = c.join('. ') + '.'
        } else {
          core = name.trim();
        }

        if (core.split(' ').length === 2) {
          o.nameFull[1] = core.split(' ')[0];
          o.nameFull[2] = core.split(' ')[1];
        } else if (core.split(' ').length === 1) {
          o.nameFull[2] = core;
        } else if (core.split(' ').length === 4) {
          o.nameFull[2] = core.split(' ')[0];
          o.nameFull[1] = core.split(o.nameFull[2] + ' ')[1];
        } else if (core.split('ml.').length > 1) {
          o.nameFull[1] = core.split(' ')[0];
          o.nameFull[2] = core.split(o.nameFull[1] + ' ')[1];
        } else {
          var s = core.split(' ');
          var m = ['Alexandra', 'Anna', 'Terezie', 'Václav', 'Ondřej', 'Nela', 'Valerie', 'Joshua', 'Alexander'];

          if (m.indexOf(s[1]) > -1) {
            o.nameFull[2] = s.pop();
            o.nameFull[1] = s.join(' ');
          } else {
            o.nameFull[1] = s.shift();
            o.nameFull[2] = s.join(' ');
          }
        }

        if (o.nameFull[2].charAt(o.nameFull[2].length - 1) === 'á') {
          o.sex = 2;
        } else {
          o.sex = 1;
        }

        if (o.nameFull[2].split('ová ').length > 1) o.sex = 2;

        if (person.links) {
          o.links = [];

          person.links.forEach(link => {
            if (typeof link === 'string') o.links.push(link);
            if (typeof link === 'object') o.links.push(link.url);
          })
        }

        o.name = core;

        if (data.data === 'lbk/spolecne') {
          var x = o.nameFull[1];
          o.nameFull[1] = o.nameFull[2];
          o.nameFull[2] = x;

          o.name = o.nameFull[1] + ' ' + o.nameFull[2];
        }

        data.list.push(o);
      });
    }

    data.people.forEach((person, index) => {
      var p = data.list.find(x => x.name === person.name)
      if (!p) console.log(data.data, index, person.name, p)
    });

    // END

    fs.writeFileSync(link, JSON.stringify(data, null, 2));

    // console.log(dataSource);
  });
});
