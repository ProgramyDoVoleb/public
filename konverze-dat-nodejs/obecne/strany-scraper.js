const $ = require('cheerio');
const fs = require('fs');

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

var html = fs.readFileSync('../zdroje/obecne/ciselnik-volebnich-stran-a-koalic.html').toString();

var rows = $('tr', html);
var parties = [];

var lastParty;

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

var color = JSON.parse(fs.readFileSync('../data/obecne/strany/barvy.json'));

Object.keys(rows).forEach(row => {

  if (rows[row].children) {
    if (rows[row].children[1]) {
      if (rows[row].children[1].attribs) {
        if (rows[row].children[1].attribs.headers === 'sa1 sb1') {
          var party = {
            reg: Number(rows[row].children[1].children[0].data),
            name: rows[row].children[5].children[0].data,
            coalition: []
          }

          if (isNaN(rows[row].children[3].children[0].data)) {
            party.short = rows[row].children[3].children[0].data;
          }

          var c = color.find(p => p.reg === party.reg);

          if (c) {
            party.color = c.color;
          } else {
            party.color = toColor(party.name.hashCode());
          }

          party.hash = betterURL(party.short || party.name);

          lastParty = party;

          parties.push(party);
        }
        if (rows[row].children[1].attribs.headers === 'sa1 sb3 sc1') {
          lastParty.coalition.push(Number(rows[row].children[1].children[0].data))
        }
      }
    }
  }

});

fs.writeFile('../data/obecne/ciselnik-volebnich-stran-a-koalic.json', JSON.stringify({
  generated: new Date().getTime(),
  list: parties
}), err => {
  console.log(err);
});

var listOfPartyJSONFile = fs.readdirSync("../data/obecne/strany/data");
var listOfPartyJSON = [];

var name = [];

listOfPartyJSONFile.forEach(function (file) {
  name = file.split("-");
  listOfPartyJSON.push({
    reg: Number(name[0]),
    path: file
  });
});

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

var primaryJSON = [];

parties.forEach(party => {
  var data = listOfPartyJSON.find(p => p.reg === party.reg);
  var file;

  if (data && fs.existsSync("../data/obecne/strany/data/" + data.path)) {

    file = JSON.parse(fs.readFileSync("../data/obecne/strany/data/" + data.path));

    if (party.coalition.length > 0) {
      file.coalition = party.coalition;
      file.color = '#aaa';
    } else {
      file.color = party.color;
    }

    if (!file.hash) {
      file.hash = betterURL(party.short || party.name);
    }
  } else {
    file = party;
    data = {
      path: party.reg + '-' + party.hash + '.json'
    }
  }

  fs.writeFile("../data/obecne/strany/data/" + data.path, JSON.stringify(file), err => {});

  file.links = undefined;

  primaryJSON.push(file);
});

fs.writeFile("../data/obecne/strany.json", JSON.stringify({
  created: new Date().getTime(),
  list: primaryJSON
}), err => {});
