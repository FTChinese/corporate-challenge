const fs = require('fs');
const path = require('path');
const stream = require('stream');
const co = require('co');
const nunjucks = require('nunjucks');

function merge(o, p) {
	for (var prop in p) {
		if (o.hasOwnProperty(prop)) {
			continue;
		} 
		o[prop] = p[prop];
	}
	return o;
}

function readJSON(filename) {
  return new Promise(
    function(resolve, reject) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          console.log('Cannot find file: ' + filename);
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    }
  );
}

nunjucks.configure('views');

co(function *() {
	const files = ['data/base.json', 'data/news-list.json'];

	const [base, news] = yield Promise.all(files.map(readJSON));
	
	for (let year in news) {
		const fileName = path.resolve('.tmp', 'cc-' + year + '.html');
		const context = merge(base, news[year]);
		const res = nunjucks.render('news.njk', context);
		
		const ws = fs.createWriteStream(fileName);
		ws.write(res);
		ws.on('error', () => {
			console.log(error);
		});
	}
}).then(function (value) {
	// console.log(value);
}, function(err) {
	console.log(err.stack);
});