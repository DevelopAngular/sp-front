const fs = require('fs');

const fileName = process.argv[2] || '';
const colorName = process.argv[3] || 'Jade';
const hex = process.argv[4] || '#00B476';

fs.readdir('assets', {encoding: 'utf8'}, (err, data) => {
  if (err) {
    console.error(err)
  }
  const raw = data.filter(file => file.includes(`${fileName} (Navy)`)).map((file, i) => {

    fs.readFile(__dirname + '/assets/' + file, {encoding: 'utf8'}, (err, data) => {
      if (err ) {
        console.error(err);
      }
      // if (i === 0) {
      console.log(data);
      let IconName = file.replace('Navy', `${colorName}`);

      let IconData = data.split('Navy').join(colorName).split(`fill="#1F195E"`).join(`fill="${hex}"`);
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
