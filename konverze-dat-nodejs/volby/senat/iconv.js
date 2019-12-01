var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    iconv = require('iconv-lite');

var parser = new xml2js.Parser();

var dates = [
  {date: 20081017, type: 0},
  {date: 20101015, type: 0},
  {date: 20110318, type: 1},
  {date: 20121012, type: 0},
  {date: 20140110, type: 1},
  {date: 20140919, type: 1},
  {date: 20141010, type: 0},
  {date: 20161007, type: 0},
  {date: 20170127, type: 1},
  {date: 20180105, type: 1},
  {date: 20180518, type: 1},
  {date: 20181005, type: 0},
  {date: 20190405, type: 1}
];

dates.forEach(vote => {
  fs.createReadStream('../zdroje/volby/senat/' + vote.date + '/serk.xml')
      .pipe(iconv.decodeStream('windows1250'))
      .pipe(iconv.encodeStream('utf8'))
      .pipe(fs.createWriteStream('../zdroje/volby/senat/' + vote.date + '/serk-utf8.xml'));
})
