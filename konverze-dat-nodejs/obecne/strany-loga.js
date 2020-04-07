var fs = require('fs');

var parties = JSON.parse(fs.readFileSync('../data/obecne/strany.json'));

var logolist = [];

var files = fs.readdirSync("../data/obecne/strany/loga");

files.forEach(file => {
  name = file.split("-");
  logolist.push({
    reg: Number(name[0]),
    path: file
  });
});

parties.list.forEach((item, i) => {
  var logo = logolist.find(x => x.reg === item.reg);

  if (logo) {
    item.logo = "/obecne/strany/loga/" + logo.path;
  } else {
    item.logo = undefined;
  }
});

fs.writeFile('../data/obecne/strany.json', JSON.stringify(parties), err => {})
