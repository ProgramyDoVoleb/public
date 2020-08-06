var fs = require('fs');

function betterURL (url) {
  var newURL = url;

  var repl = [[' ', '-'],['.', '-'],[',', '-'],['–', '-'],['?', ''],['!', ''],['(', ''],[')', ''],['á', 'a'],['č', 'c'],['ď', 'd'],['é', 'e'],['ě', 'e'],['í', 'i'],['ľ', 'l'],['ň', 'n'],['ó', 'o'],['ř', 'r'],['š', 's'],['ť', 't'],['ú', 'u'],['ů', 'u'],['ý', 'y'],['ž', 'z']];

  newURL = newURL.toLowerCase();

  repl.forEach(r => newURL = newURL.split(r[0]).join(r[1]));

  return newURL;
}

var regionIDList = ['stk', 'jck', 'plk', 'kvk', 'ulk', 'lbk', 'khk', 'pak', 'vys', 'jmk', 'olk', 'zlk', 'msk']

var election = JSON.parse(fs.readFileSync('./data/volby/kv/2020/list.json'));

election.list.forEach((region, regionID) => {
  region.parties.forEach(party => {
    var dataSource = party.data;

    if (!dataSource) {
      if (party.reg) {
        dataSource = regionIDList[regionID] + '/' + party.reg;
      } else if (party.name) {
        dataSource = regionIDList[regionID] + '/' + betterURL(party.name);
      } else if (party.coalition) {
        var name = [];

        party.coalition.forEach(member => {
          if (typeof member === 'number') name.push(member);
          if (typeof member === 'string') name.push(betterURL(member));
          if (typeof member === 'object') name.push(betterURL(member.name));
        })

        dataSource = regionIDList[regionID] + '/' + name.join('-');
      }
    }

    var link = './data/volby/kv/2020/data/' + dataSource + '.json';

    var data = {};

    if (fs.existsSync(link)) {
      data = JSON.parse(fs.readFileSync(link))
    } else {
      data = {}
    }

    // DO STUFF

    data.lastUpdate = new Date();
    data.data = dataSource;

    // END

    fs.writeFileSync(link, JSON.stringify(data, null, 2));

    console.log(dataSource);
  });
});
