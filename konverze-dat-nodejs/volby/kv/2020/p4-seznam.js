var fs = require('fs');

var list = JSON.parse(fs.readFileSync('../zdroje/current/utf/kandidati.json'));

var cands = JSON.parse(fs.readFileSync('../data/volby/kv/2020/list2.json'));

list.forEach((region, index) => {
  region.forEach(party => {
    var lookup = cands.list[index].parties.find(x => x.no === party.no);

    var file = '../data/volby/kv/2020/data/' + lookup.data + '.json'

    var data = JSON.parse(fs.readFileSync(file));

    var backup = [];

    if (data.list) {
      data.list.forEach(i => backup.push(i));
    }

    data.list = party.list;

    party.list.forEach(person => {
      var p = backup.find(x => x.nameFull[2] === person.nameFull[2] && x.nameFull[1] === person.nameFull[1]);

      if (p) {
        if (p.links) person.links = p.links;
        if (p.sex) person.sex = p.sex;
        if (p.work) person.work = p.work;
        if (p.photo) person.photo = p.photo;
      }
    })

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  });
})
