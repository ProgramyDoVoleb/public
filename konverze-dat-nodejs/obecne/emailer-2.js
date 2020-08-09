var fs = require('fs');

var json = JSON.parse(fs.readFileSync('zdroje/emailer.json'));
var link = JSON.parse(fs.readFileSync('zdroje/emailer-2.json'));

link.list.forEach(p => {
  var item = json.list.find(x => x.data === p.data);

  if (item) {
    item.link = "https://krajskevolby2020.programydovoleb.cz" + p.link;
  }
});

json.list.forEach(item => {
  if (item.data.split('senat').length > 1) {
    item.link = "https://senatnivolby2020.programydovoleb.cz/" + "kandidat/" + item.data.split('/')[4];
  }
});

fs.writeFileSync('zdroje/emailer.json', JSON.stringify(json, null, 2));
