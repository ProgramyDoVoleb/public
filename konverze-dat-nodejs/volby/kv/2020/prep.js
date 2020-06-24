var fs = require('fs');
var election = JSON.parse(fs.readFileSync('../data/volby/kv/2020/list.json'));
var regions = ["pha", "stk", "jck", "plk", "kvk", "ulk", "lbk", "khk", "pak", "vys", "jmk", "olk", "zlk", "msk"];

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

function betterURL (url) {
  var newURL = url;

  newURL = newURL.toLowerCase();
  newURL = newURL.replaceAll(' ', '-');
  newURL = newURL.replaceAll('.', '-');
  newURL = newURL.replaceAll(',', '-');
  newURL = newURL.replaceAll('–', '-');
  newURL = newURL.replaceAll('?', '');
  newURL = newURL.replaceAll('!', '');
  newURL = newURL.replaceAll('(', '');
  newURL = newURL.replaceAll(')', '');
  newURL = newURL.replaceAll('á', 'a');
  newURL = newURL.replaceAll('č', 'c');
  newURL = newURL.replaceAll('ď', 'd');
  newURL = newURL.replaceAll('é', 'e');
  newURL = newURL.replaceAll('ě', 'e');
  newURL = newURL.replaceAll('í', 'i');
  newURL = newURL.replaceAll('ľ', 'l');
  newURL = newURL.replaceAll('ň', 'n');
  newURL = newURL.replaceAll('ó', 'o');
  newURL = newURL.replaceAll('ř', 'r');
  newURL = newURL.replaceAll('š', 's');
  newURL = newURL.replaceAll('ť', 't');
  newURL = newURL.replaceAll('ú', 'u');
  newURL = newURL.replaceAll('ů', 'u');
  newURL = newURL.replaceAll('ý', 'y');
  newURL = newURL.replaceAll('ž', 'z');

  return newURL;
}

election.list.forEach(region => {
  region.parties.forEach(party => {
    var src = party.data;
    var dataExists = src ? true : false;

    if (!src) {
      if (party.reg) {
        src = regions[region.id] + '/' + party.reg;
      } else if (party.name) {
        src = regions[region.id] + '/' + betterURL(party.name);
      } else if (party.coalition) {
        src = regions[region.id] + '/';
        var mems = [];

        party.coalition.forEach(member => {
          if (typeof member === 'number') {
            mems.push(member);
          } else {
            mems.push(betterURL(member.name));
          }
        });
        src += mems.join('-');
      } else {
        src = regions[region.id] + '/' + Math.round(Math.random() * 1000 + 1000);
      }
    }

    var data = {};

    if (dataExists === true) {
      data = JSON.parse(fs.readFileSync('../data/volby/kv/2020/data/' + src + '.json'));
    }

    if (!data.people) data.people = [];

    if (data.people.length === 0 && party.leader) {
      data.people.push({
        name: party.leader.name,
        reg: party.leader.reg,
        links: party.leader.links,
        photo: party.leader.photo
      })
    }

    if (party.list) {
      party.list.forEach((person, index) => {
        if (index > 3) return;

        var name = person.name || person;
        var reg = person.reg || party.reg;

        if (!data.people.find(x => x.name === name)) {
          var obj = {
            name,
            reg,
            links: []
          }

          data.people.push(obj);
        }
      });
    }

    fs.writeFileSync('../data/volby/kv/2020/data/' + src + '.json', JSON.stringify(data, null, 2));
  });
});
