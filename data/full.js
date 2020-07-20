const fs = require('fs');
const { execSync } = require('child_process');

var dir = "./volby/kv/2020/";

var files = fs.readdirSync(dir + "strany/");

var json = {list: []};

files.forEach(file => {
  var content = JSON.parse(fs.readFileSync(dir + "strany/" + file));
  json.list.push(content);
})

fs.writeFileSync(dir + 'strany.json', JSON.stringify(json, null, 2));

var cmsg = process.argv[2] || "Aktualizace výpisu stran";

setTimeout(() => execSync('git add --all',{stdio: 'inherit'}), 100);
setTimeout(() => execSync('git commit -a -m "' + cmsg + '"',{stdio: 'inherit'}), 150);
setTimeout(() => execSync('git ftp push',{stdio: 'inherit'}), 200);
