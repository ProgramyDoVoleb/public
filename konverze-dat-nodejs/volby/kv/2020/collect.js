var fs = require('fs');

var dir = "../data/volby/kv/2020/";

var files = fs.readdirSync(dir + "strany/");

var json = {list: []};

files.forEach(file => {
  var content = JSON.parse(fs.readFileSync(dir + "strany/" + file));
  json.list.push(content);
})

fs.writeFileSync(dir + 'strany-v2.json', JSON.stringify(json, null, 2));
