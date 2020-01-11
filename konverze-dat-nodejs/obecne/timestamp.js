const fs = require('fs');
const util = require('util');

var file = "../data/obecne/seznam-voleb.json";

function writeFile (json, file) {
  fs.writeFile(file, JSON.stringify(json), function(err) {

      if(err) {
          return console.log(err);
      }
  });
}

var main = JSON.parse(fs.readFileSync(file));

function beautifyDate (date) {
  var day = date % 100;
  var month = Math.floor(date / 100) % 100;
  var year = Math.floor(date / 10000);

  return [day, month - 1, year];
}

main.list.forEach(type => {
  type.list.forEach(election => {

    election.timestamps = [];

    election.date.forEach(d => {
      var date = beautifyDate(d);
      var iso = new Date(date[2], date[1], date[0], '14');

      // console.log(iso);

      election.timestamps.push(iso.getTime() / 100000);
    });
  });
});

writeFile(main, file)
