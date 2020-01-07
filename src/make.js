const fs = require('fs');

const fileName = process.argv[2] || 'Untitled';
const exiting = process.argv[3] || 'Navy';
const colorName = process.argv[4] || 'Jade';
// const hex = process.argv[4] || '#00B476';

const colors = {
  'Navy': '#1F195E',
  'Blue-Gray': '#7F879D',
  'Jade': '#00B476',
  'White': '#FFFFFF',
  'Red': '#E32C66',
}

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

      let IconData = data.split(`${exiting}`).join(colorName).split(`fill="${colors[exiting]}"`).join(`fill="${colors[colorName]}"`);
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
