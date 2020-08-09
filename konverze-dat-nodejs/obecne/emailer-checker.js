var fs = require('fs');

var json = JSON.parse(fs.readFileSync('zdroje/emailer.json'));


var hashlist = [];

function test(hash) {
  if (hashlist.find(x => x === hash)) {
    console.log(hash + " used");
  } else {
    hashlist.push(hash);
  }
}

json.list.forEach(i => test(i.hash));
