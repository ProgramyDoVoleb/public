var fs = require('fs');

var sweepFile = 'zdroje/volby/psp/2021/sweep/psp-sweep.json';
var hlidacFile = 'zdroje/volby/psp/2021/sweep/hlidac/201130.json';

var sweep = JSON.parse(fs.readFileSync(sweepFile));
var hlidac = JSON.parse(fs.readFileSync(hlidacFile));

function betterURL (url) {
  var newURL = url;

  var repl = [[' ', '-'],['+', '-'],['.', '-'],[',', '-'],['–', '-'],['?', ''],['!', ''],['(', ''],[')', ''],['á', 'a'],['č', 'c'],['ď', 'd'],['é', 'e'],['ě', 'e'],['í', 'i'],['ľ', 'l'],['ň', 'n'],['ó', 'o'],['ř', 'r'],['š', 's'],['ť', 't'],['ú', 'u'],['ů', 'u'],['ý', 'y'],['ž', 'z']];

  newURL = newURL.toLowerCase();

  repl.forEach(r => newURL = newURL.split(r[0]).join(r[1]));

  return newURL;
}

function hashCode (s) {
    var hash = 0;
    if (s.length == 0) {
        return hash;
    }
    for (var i = 0; i < s.length; i++) {
        var char = s.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

sweep.forEach(member => {
  var hlidano = hlidac.find(x => x.Jmeno === member.nameFull[1] && x.Prijmeni === member.nameFull[2]);

  member.embeds = [];
  member.sex = 1;
  member.born = "1900-01-01";

  if (member.nameFull[2].charAt(member.nameFull[2].length - 1) === 'á') member.sex = 2;

  member.work = member.sex === 2 ? "poslankyně" : "poslanec";

  if (hlidano) {
    member.born = hlidano.Narozeni;
    if (hlidano.WWW != "NULL") {
      member.links.push(hlidano.WWW);
    }
    if (hlidano.Facebook_page != "NULL") {
      member.links.push('https://facebook.com/' + hlidano.Facebook_page);
      member.embeds.push('https://facebook.com/' + hlidano.Facebook_page);
    }
    if (hlidano.Twitter != "NULL") {
      member.links.push('https://twitter.com/' + hlidano.Twitter);
      member.embeds.push('https://twitter.com/' + hlidano.Twitter);
    }
    if (hlidano.Instagram != "NULL") {
      member.links.push('https://instagram.com/' + hlidano.Instagram);
    }
    if (hlidano.Facebook_profile != "NULL") {
      member.links.push('https://facebook.com/' + hlidano.Facebook_profile);
    }
    if (hlidano.facebook != "NULL") {
      member.links.push('https://facebook.com/' + hlidano.facebook);
    }
    member.links.push('https://nasipolitici.cz/detail/' + hlidano['﻿NameId']);
    member.links.push('https://hlidacstatu.cz/osoba/' + hlidano['﻿NameId']);
  } else {
    console.log(member.name, 'not found in hlidac');
  }

  member.hash = betterURL(member.nameFull[2] + '-' + member.nameFull[1] + '-' + member.born.slice(2, 4) + '-' + String(hashCode(member.born + '-' + member.name)).slice(2, 6));

});

fs.writeFileSync(sweepFile, JSON.stringify(sweep, null, 2));
