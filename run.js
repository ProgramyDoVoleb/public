var fs = require('fs');
var ftp = require("basic-ftp")

var structure = JSON.parse(fs.readFileSync('./data/obecne/obce-flat.json'));

async function uploadResults() {
    const client = new ftp.Client()
    client.ftp.verbose = true;

    try {
        await client.access({
            host: "200368.w68.wedos.net",
            user: "w200368_data",
            password: "Polist.2020",
            secure: true
        })

        var c = [];

        Object.keys(structure.list).forEach((key, index) => {
          if (Number(key.split('CZ')[1]) < 525 || ['CZ020A', 'CZ020B', 'CZ020C'].indexOf(key) > -1) return;

          structure.list[key].forEach((town, i2) => {
            var name = key + '/' + town[0];
            var from = './data/souhrny/obce/' + name + '.json';
            var to = './souhrny/obce/' + name + '.json';

            c.push([from, to]);
          });
        });

        console.log(c.length, c[0])

        for (var i = 0; i < c.length; i++) {
          await client.uploadFrom(c[i][0], c[i][1]);
        }
    }
    catch(err) {
        console.log(err)
    }
    client.close()
}

uploadResults()
