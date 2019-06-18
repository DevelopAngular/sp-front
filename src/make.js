const fs = require('fs');

const fileName = process.argv[2] || 'Jade';
const hex = process.argv[3] || '#00B476';

fs.readdir('assets', {encoding: 'utf8'}, (err, data) => {
  if (err) {
    console.error(err)
  }
  const raw = data.filter(fileName => fileName.includes('Sort (Navy)')).map((file, i) => {

    fs.readFile(__dirname + '/assets/' + file, {encoding: 'utf8'}, (err, data) => {
      if (err ) {
        console.error(err);
      }
      // if (i === 0) {
      console.log(data);
      let jadeIconName = file.replace('Navy', `${fileName}`);

      // let jadeIconData = data.split('Navy').join('Jade').split(`fill="#7F879D"`).join(`fill="#00B476"`);
      let jadeIconData = data.split('Navy').join('Jade').split(`fill="#1F195E"`).join(`fill="${hex}"`);
      fs.writeFile('assets/' + jadeIconName, jadeIconData, (err) => {
        if (err) {
          console.error(err);
        }
      });
      // }
    })
    return file;
  });
})
