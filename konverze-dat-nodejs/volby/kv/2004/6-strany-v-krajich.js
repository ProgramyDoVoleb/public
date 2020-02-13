var fs = require('fs');
var $ = require('cheerio');

var year = 2004;

var sourceDIR = '../zdroje/volby/kv/' + year + '/';
var targetDIR = '../data/volby/kv/' + year + '/';

var htmlParties = fs.readFileSync(sourceDIR + 'strany.html').toString();
var htmlCandidates = fs.readFileSync(sourceDIR + 'listiny.html').toString();

var jsonAllParties = [];
var jsonCandidates = [];
var jsonParties = [];

// projde ciselnik vsech existujicich stran

var rowsParties = $('td[align=CENTER]', htmlParties);

Object.keys(rowsParties).forEach(row => {
  var obj = {};

  if (!rowsParties[row].type) return;

  obj.reg = Number(rowsParties[row].children[0].data);
  obj.short = rowsParties[row].next.next.children[0].data;
  obj.name = rowsParties[row].next.next.next.next.children[0].data;

  jsonAllParties.push(obj);
});

fs.writeFile(targetDIR + 'ciselnik.json', JSON.stringify(jsonAllParties), () => {});

// projde tabulku vsech registrovanych kandidatnich listin

var color = JSON.parse(fs.readFileSync('../data/obecne/strany/barvy.json'));

String.prototype.hashCode = function () {
  var hash = 0;
  if (this.length === 0) {
    return hash;
  }
  for (var i = 0; i < this.length; i++) {
    var char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};

function betterURL (url) {
  var newURL = url;

  newURL = newURL.toLowerCase();
  newURL = newURL.replaceAll(' ', '-');
  newURL = newURL.replaceAll('.', '');
  newURL = newURL.replaceAll(',', '-');
  newURL = newURL.replaceAll('(', '');
  newURL = newURL.replaceAll(')', '');
  newURL = newURL.replaceAll('"', '');
  newURL = newURL.replaceAll('\"', '');
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

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function toColor (num) {
  num >>>= 0;
  var b = num & 0xFF;
  var g = (num & 0xFF00) >>> 8;
  var r = (num & 0xFF0000) >>> 16;

  return rgbToHex(r, g, b);

  // return 'rgb(' + [r, g, b].join(',') + ')';
}

var lastParty;

var rowsCandidates = $('tr', htmlCandidates);

var ix = 0;

Object.keys(rowsCandidates).forEach(row => {

  if (rowsCandidates[row].children) {

    var children = $('td', rowsCandidates[row]);

    if (children.length === 3) {
      var party = {
        id: Number(children[0].children[0].data),
        short: children[1].children[0].data,
        name: children[2].children[0].data,
        coalition: []
      };

      var realParty = jsonAllParties.find(p => p.short === party.short);

      if (realParty) {
        var c = color.find(p => p.reg === realParty.reg);

        party.reg = realParty.reg;

        if (c) {
          party.color = c.color;
        } else {
          party.color = toColor(party.name.hashCode());
        }
      } else {
        party.reg = 90000 + ix;
        party.color = '#aaa';
        ix++;
      }

      party.hash = betterURL(party.short || party.name);

      lastParty = party;

      jsonCandidates.push(party);

    } else if (children.length === 2) {

      var reg = Number(children[0].children[0].data);

      lastParty.coalition.push(reg);

    }
  }

});

fs.writeFile(targetDIR + 'listiny.json', JSON.stringify(jsonCandidates), () => {});

// vytvori hlavni soubor stran

var parties = JSON.parse(fs.readFileSync('../data/obecne/strany.json')).list;

jsonCandidates.forEach(party => {
  var node = parties.find(p => p.reg === party.reg);

  if (node) {
    party.logo = node.logo;
  }

  jsonParties.push(party);
});

fs.writeFile(targetDIR + 'strany.json', JSON.stringify({
  created: new Date().getTime(),
  list: jsonParties
}), () => {});
