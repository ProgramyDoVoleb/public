const fs = require('fs');
const { execSync } = require('child_process');

var dir = "../data/volby/kv/2020/";

var files = fs.readdirSync(dir + "strany/");

var json = {list: []};

files.forEach(file => {
  var content = JSON.parse(fs.readFileSync(dir + "strany/" + file));
  json.list.push(content);
})

fs.writeFileSync(dir + 'strany.json', JSON.stringify(json, null, 2));

execSync('git commit -a -m "Aktualizace výpisu stran"',{stdio: 'inherit'})
execSync('git ftp push',{stdio: 'inherit'})
