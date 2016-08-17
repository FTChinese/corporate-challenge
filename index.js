const fs = require('fs');
const path = require('path');
const marked = require('marked');
const co = require('co');
const nunjucks = require('nunjucks');
const mdirp = require('mkdirp');
const helper = require('./helper');


nunjucks.configure('views', {
  autoescape: false,
  watch: true,
  noCache: true
});

co(function *() {
	const files = ['data/base.json', 'data/news-list.json'];
	const destDir = '.tmp';

	const stat = yield helper.stat(destDir);
	if (!stat.isDirectory()) {
		mkdirp(destDir, (err) => {
			if (err) {
				return err;
			}
		});
	}

	const [base, news] = yield Promise.all(files.map(helper.readJSON));
	
	for (let name in news) {
    const fileData = news[name];

    var tplFile = '';
    if (name === 'index') {
      tplFile = 'index.njk';
    } else {
      tplFile = 'news.njk';
    }

		const htmlPath = path.resolve('.tmp', name + '.html');
		const mdArr = yield Promise.all(fileData.newsList.map(helper.readMd));
// base is an object reference, so you need to override its.
// is it better to clone the object?
		const context = helper.extend(base, helper.extend(fileData, {newsList: mdArr}));
		
		const res = nunjucks.render(tplFile, context);
		
		const ws = fs.createWriteStream(htmlPath);
		ws.write(res);
		ws.on('error', (error) => {
			console.log(error);
		});
	}
}).then(function (value) {
	// console.log(value);
}, function(err) {
	console.log(err.stack);
});