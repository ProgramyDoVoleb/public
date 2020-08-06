var fs = require('fs');

var link = './data/volby/kv/2020/data/' + process.argv[2];

var party = JSON.parse(fs.readFileSync(link));



fs.writeFileSync(link, JSON.stringify(party, null, 2));
