import { ajax, createElement } from './util';

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

		this.rootEl = rootEl;
		this.hasLoaded = false;
		this.config.url = config.url ? config.url : rootEl.getAttribute('data-content-url')
		if (hasLoaded) {
			return;
		}
		this.loadContent();
	}

	loadContent() {
		ajax.getData(this.config.url, (err, data) => {
			if (err) return;

			const articleEl = convertMd(data, this.config.className);
			this.rootEl.appendChild(articleEl);
			this.hasLoaded = true;
		});
	}
}

export default ContentLoader;