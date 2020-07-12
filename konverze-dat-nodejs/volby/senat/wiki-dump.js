var fs = require('fs');

var json = JSON.parse(fs.readFileSync('../data/volby/senat/20201002/kandidati.json'));

var wiki = JSON.parse(fs.readFileSync('../data/volby/senat/20201002/wiki-dump.json'));

wiki.forEach(item => {

  var ns = item.name.split(' ');

  var person = json.list.find(p => p.name[2] === ns[1] && p.name[1] === ns[0]);

  if (!person) {
    console.log(item.name);
  } else {
    person.work = item.work;

    if (item.link.split('&action=edit&').length === 1) {
      if (!person.links.find(l => l === item.link)) {
        person.links.push(item.link);
      }
    }
  }
});

fs.writeFileSync('../data/volby/senat/20201002/kandidati.json', JSON.stringify(json, null, 2));
