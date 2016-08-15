const promisify = require('promisify-node');
const fs = promisify('fs');
const path = require('path');
const stream = require('stream');
const marked = require('marked');
const co = require('co');
const nunjucks = require('nunjucks');
const helper = require('./helper');


nunjucks.configure('views', {
  autoescape: false
});

co(function *() {
	const files = ['data/base.json', 'data/news-list.json'];

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