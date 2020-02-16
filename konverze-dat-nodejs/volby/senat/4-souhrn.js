var fs = require('fs');

var list = [19961116, 19981114, 19990828, 20001112, 20021025, 20031107, 20031031, 20041105, 20041008, 20061020, 20070413, 20070427, 20081017, 20101015, 20110318, 20121012, 20140110, 20140919, 20141010, 20161007, 20170127, 20180105, 20180518, 20181005, 20190405];

const targetDIR = '../data/volby/senat/';
const summary = '../data/obecne/senatni-volby.json';

var content = JSON.parse(fs.readFileSync(summary));

while (content.dates.length > 0) content.dates.pop();

list.forEach(dir => {
  var file = JSON.parse(fs.readFileSync(targetDIR + dir + '/vysledky.json'));

  var obj = {
    date: dir,
    obvod: []
  }

  file.areas.forEach(area => obj.obvod.push(area.id));

  obj.obvod.sort((a, b) => a - b);

  content.dates.push(obj);
});

fs.writeFile(summary, JSON.stringify(content), () => {});
