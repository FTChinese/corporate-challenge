import Share from 'ftc-share';
import Expander from './expander';
Share.init();

var exp = Expander.init();
console.log(exp);

// ajax.getData('index.md', function(err, data) {
// 	if (err) return;
// 	const mdToHtml = marked(data);
// 	// console.log(mdToHtml);
// 	document.querySelector('.top-story__article').innerHTML = mdToHtml;
// });

function updateFooterYear(rootEl) {
	if (!rootEl) {
		rootEl = document.body;
	} else if (!(rootEl instanceof HTMLElement)) {
		rootEl = document.querySelector(rootEl);
	}

	var yearEl = rootEl.querySelector('.o-footer__copyright-year');
	var year = new Date().getFullYear();
	yearEl.textContent = year;
	return year;
}

updateFooterYear('[data-o-component="o-footer"]');