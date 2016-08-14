const fs = require('fs');
const path = require('path');
const stream = require('stream');
const marked = require('marked');
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

function readMd(filename) {
  return new Promise(
    function(resolve, reject) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          console.log('Cannot find file: ' + filename);
          reject(err);
        } else {
          resolve(marked(data));
        }
      });
    }
  );
}

nunjucks.configure('views', {
  autoescape: false
});

co(function *() {
  const files = ['data/base.json', 'data/test.json'];
  const [base, news] = yield Promise.all(files.map(readJSON));

  for (let year in news) {
    const fileName = path.resolve('.tmp', 'cc-' + year + '.html');
    console.log
    const mdArr = yield Promise.all(news[year].map(readMd));

    const context = merge(base, {newsList: mdArr});

    const res = nunjucks.render('test.njk', context);
    
    const ws = fs.createWriteStream(fileName);
    ws.write(res);
    ws.on('error', () => {
      console.log(error);
    });
  }

 //  const files = ['public/index.md', 'public/2015-news01.md'];

	// const mdArr = yield Promise.all(files.map(readMd));

 //  const res = nunjucks.render('test.njk', {newsList: mdArr});
 //  console.log(res);

}).then(function (value) {
	// console.log(value);
}, function(err) {
	console.log(err.stack);
});