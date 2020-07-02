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

var cmsg = process.argv[2] || "Aktualizace výpisu stran";

setTimeout(() => {
  execSync('find ../data/obecne/strany/loga -type f -exec chmod 0755 {} \\;',{stdio: 'inherit'});
  execSync('find ../data/lide/fotky -type f -exec chmod 0755 {} \\;',{stdio: 'inherit'});
  execSync('find ../data/volby/kv/2020/data -type f -exec chmod 0755 {} \\;',{stdio: 'inherit'});
}, 500);
setTimeout(() => execSync('git add --all',{stdio: 'inherit'}), 4000);
setTimeout(() => execSync('git commit -a -m "' + cmsg + '"',{stdio: 'inherit'}), 4500);
setTimeout(() => execSync('git ftp push',{stdio: 'inherit'}), 5000);
