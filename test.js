const fs = require('fs');

fs.readdir('public/images/2015', (err, files) => {
  console.log(files);
})
