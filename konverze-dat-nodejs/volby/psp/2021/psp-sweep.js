var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');

var sweepFile = 'zdroje/volby/psp/2021/sweep/psp-sweep.json';
var sweep = JSON.parse(fs.readFileSync(sweepFile));

sweep.forEach(member => {
  request.get('https://www.psp.cz/sqw/detail.sqw?id=' + member.psp.id + '&o=8')
    .pipe(iconv.decodeStream('win-1250'))
    .pipe(iconv.encodeStream('utf8'))
    .pipe(fs.createWriteStream('zdroje/volby/psp/2021/sweep/detail/' + member.psp.id + '.html'));
  //
  // request.get('https://www.psp.cz/sqw/pstat.sqw?o=8&id=' + member.psp.id + '&id_posl=1526')
  //   .pipe(iconv.decodeStream('win-1250'))
  //   .pipe(iconv.encodeStream('utf8'))
  //   .pipe(fs.createWriteStream('zdroje/volby/psp/2021/sweep/stats/' + member.psp.id + '.html'));

  // request.get('https://www.psp.cz/eknih/cdrom/2017ps/eknih/2017ps/poslanci/i' + member.psp.id + '.jpg')
  //   // .pipe(iconv.decodeStream('win-1250'))
  //   // .pipe(iconv.encodeStream('utf8'))
  //   .pipe(fs.createWriteStream('zdroje/volby/psp/2021/sweep/photo/' + member.psp.id + '.jpg'));
})
