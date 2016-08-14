import { ajax, createElement, merge } from './util';

function convertMd(md, className) {
	var renderedMd = marked(md);
	var articleEl = createElement('article', {'class': className});
	articleEl.innerHTML = renderedMd;
	return articleEl;
}

// use config.url first, fallback to data-content-url attr.
// config.url resource address
// config.className for created element
class ContentLoader {
	constructor(rootEl, config) {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		
		if (!rootEl) {
			return;
		}
		this.rootEl = rootEl;
		this.hasLoaded = false;

		const opts = config || {};
		const defaultOpts = {
			url: rootEl.getAttribute('data-content-url'),
			className: 'ajax-content'
		};
		merge(opts, defaultOpts);
		
		if (this.hasLoaded) {
			return;
		}
		this.loadContent(opts.url, opts.className);
	}

	loadContent(url, className) {
		ajax.getData(url, (err, data) => {
			if (err) return;

			const articleEl = convertMd(data, className);

			this.rootEl.appendChild(articleEl);

			this.hasLoaded = true;
		});
	}
}

export default ContentLoader;