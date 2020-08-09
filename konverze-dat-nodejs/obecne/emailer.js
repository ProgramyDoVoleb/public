var fs = require('fs');

function betterURL (url) {
  var newURL = url;

  var repl = [[' ', '-'],['.', '-'],[',', '-'],['–', '-'],['?', ''],['!', ''],['(', ''],[')', ''],['á', 'a'],['č', 'c'],['ď', 'd'],['é', 'e'],['ě', 'e'],['í', 'i'],['ľ', 'l'],['ň', 'n'],['ó', 'o'],['ř', 'r'],['š', 's'],['ť', 't'],['ú', 'u'],['ů', 'u'],['ý', 'y'],['ž', 'z']];

  newURL = newURL.toLowerCase();

  repl.forEach(r => newURL = newURL.split(r[0]).join(r[1]));

  return newURL;
}

var json = JSON.parse(fs.readFileSync('zdroje/emailer.json'));
var k = JSON.parse(fs.readFileSync('data/volby/kv/2020/list2.json')).list;
var s = JSON.parse(fs.readFileSync('data/volby/senat/20201002/kandidati.json')).list;

json.list.forEach(item => {
  var obj = {};

  obj.name = item.name;
  obj.anwers = ['', '', '', ''];
  obj.program = "";
  obj.motto = "";

  if (item.data.split('/senat/').length === 2) {
    var p = s.find(x => betterURL(item.name) === betterURL(x.name[1] + ' ' + x.name[2]));

    obj.about = "";
    obj.photo = !!item.photo;
    obj.program = item.program || "";
    obj.motto = item.motto || "";
    obj.type = "senat";

    if (p) {
      obj.photo = !!p.photo;
      obj.program = p.program || "";
      obj.motto = p.motto || "";
    }
  } else {
    obj.type = "kv";
    var data = JSON.parse(fs.readFileSync('data/' + item.data.split('odpovedi').join('data') + '.json'));

    obj.leader = {
      name: "",
      about: "",
      quote: "",
      photo: false
    }

    if (data && data.program) {
      obj.program = data.program.source || "";
      obj.motto = data.program.motto || "";
    }

    if (data && data.people && data.list && data.list.length > 0) {
      obj.leader.name = data.list[0].nameFull[1] + ' ' + data.list[0].nameFull[2];
      obj.leader.about = data.people[0].about || '';
      obj.leader.quote = data.people[0].quote || '';
      obj.leader.photo = !!data.list[0].photo;
    }
  }

  fs.writeFileSync('data/' + item.data + '.json', JSON.stringify(obj, null, 2));
});
