var fs = require('fs');

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

var election = JSON.parse(fs.readFileSync('../data/volby/kv/2020/list.json'));
var data = JSON.parse(fs.readFileSync('../data/volby/kv/2020/strany.json'));

var parties = [];

function getParty (cand) {
  var party, glob;

  if (cand.reg) {
    party = parties.find(p => p.reg === cand.reg);
    glob = data.list.find(p => p.reg === cand.reg);
  }
  if (!cand.reg && cand.name) {
    party = parties.find(p => p.hash === betterURL(cand.name));
  }
  if (typeof cand === 'string') {
    party = {
      name: cand,
      short: cand
    }

    party.hash = betterURL(cand);

    parties.push(party);
  }

  if (!party && glob) {
    party = {
      reg: cand.reg,
      name: cand.name || glob.name,
      short: cand.short || glob.short,
      color: cand.color || glob.color,
      logo: cand.logo || glob.logo
    }

    party.hash = cand.hash || glob.hash;

    parties.push(party);
  }

  if (!party && !glob) {

    party = {
      reg: cand.reg,
      name: cand.name,
      short: cand.short || cand.name,
      color: cand.color,
      logo: cand.logo
    }

    party.hash = betterURL(cand.name);

    parties.push(party);
  }

  if (party.links && !party.links.regional) party.links.regional = [];

  if (!party.links) party.links = {global: [], regional: []};

  return party;
}

function addLinks (cand, links, region) {
  var party = getParty(cand);

  var obj = {
    region: region,
    links: []
  };

  (links || []).forEach(link => {
    if (typeof link === 'string') {
      obj.links.push(link);
    } else {
      obj.links.push(link.url);
    }
  });

  party.links.regional.push(obj);
}

election.list.forEach(region => {
  region.parties.forEach(cand => {
    if (cand.reg) addLinks(cand, cand.links, region.id);
    if (cand.coalition) cand.coalition.forEach(member => {
      if (typeof member === 'number') {
        addLinks({reg: member}, cand.links, region.id);
      } else {
        addLinks(member, cand.links, region.id);
      }
    });
    if (cand.support) cand.support.forEach(member => {
      if (typeof member === 'number') {
        addLinks({reg: member}, cand.links, region.id);
      } else {
        addLinks(member, cand.links, region.id);
      }
    });
  });
});

parties.sort((a, b) => (a.reg || 10000) - (b.reg || 10001));

parties.forEach(party => {
  var filename = (party.reg || 'x') + '-' + party.hash;

  if (party.reg === 769) filename = '769-rn---vu';

  if (party.reg) {

    var p = JSON.parse(fs.readFileSync('../data/obecne/strany/data/' + filename + '.json'));

    if (p && p.links && p.links.global) {
      p.links.global.forEach(link => {
        party.links.global.push(link.url || link);
      })
    }
  }

  fs.writeFileSync('../data/volby/kv/2020/strany/' + filename + '.json', JSON.stringify(party, null, 2));
});
