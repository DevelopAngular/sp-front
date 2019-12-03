const fs = require('fs');

const fileName = process.argv[2] || '';
const colorName = process.argv[3] || 'Jade';
const hex = process.argv[4] || '#00B476';
const exiting = process.argv[5] || 'Navy';

fs.readdir('assets', {encoding: 'utf8'}, (err, data) => {
  if (err) {
    console.error(err)
  }
  const raw = data.filter(file => file.includes(`${fileName} (${exiting})`)).map((file, i) => {

    fs.readFile(__dirname + '/assets/' + file, {encoding: 'utf8'}, (err, data) => {
      if (err ) {
        console.error(err);
      }
      // if (i === 0) {
      console.log(data);
      let IconName = file.replace(`${exiting}`, `${colorName}`);

      let IconData = data.split(`${exiting}`).join(colorName).split(`fill="#1F195E"`).join(`fill="${hex}"`);
      fs.writeFile('assets/' + IconName, IconData, (err) => {
        if (err) {
          console.error(err);
        }
      });
      // }
    })
    return file;
  });
})
