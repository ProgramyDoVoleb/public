var fs = require('fs');

var source = 'zdroje/volby/psp/2021/sweep/hlidac/201130.txt';
var target = 'zdroje/volby/psp/2021/sweep/hlidac/201130.json';

var array = fs.readFileSync(source).toString().split("\n");

var json = [];

var headers;

for(i in array) {
  if (i === 0) return;

  headers = headers || array[0].split('\t');
  var list = array[i].split('\t');

  var obj = {};

  list.forEach((item, index) => {
    obj[headers[index].split('\r').join('')] = item.split('\r').join('');
  });

  json.push(obj);
}

fs.writeFileSync(target, JSON.stringify(json, null, 2));
