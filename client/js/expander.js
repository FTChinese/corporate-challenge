import Toggle from './toggle';
import {merge} from './util';

class Expander {
	constructor(rootEl, config) {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		this.rootEl = rootEl;

		this.toggleEl = rootEl.querySelector('.o-expander__toggle');
		this.contentEl = rootEl.querySelector('.o-expander__content');

		config = config || {};
		const defaultConfig = {
			expandedToggleText: '折叠',
			collapsedToggleText: '展开'
		}
		this.opts = merge(config, defaultConfig);


		this.expanded = false;
		this.handleClick();
		this.rootEl.addEventListener('click', (e) => {
			if (e.target === this.toggleEl) {
				this.handleClick();
			}
		});
	}

	handleClick() {		
		if (this.expanded) {
			this.toggleEl.setAttribute('aria-expanded', 'true');
			this.toggleEl.textContent = this.opts.expandedToggleText;
			this.contentEl.setAttribute('aria-hidden', 'false');
		} else {
			this.toggleEl.setAttribute('aria-expanded', 'false');
			this.contentEl.setAttribute('aria-hidden', 'true');
			

			this.toggleEl.textContent = this.opts.collapsedToggleText;
		}
		this.expanded = !this.expanded;
	}

	static init(el, opts) {
		const expanderInstances = [];
		if (!el) {
			el = document.body;
		} else if (!(el instanceof HTMLElement)) {
			el = document.querySelector(el);
		}

		const expanderEls = el.querySelectorAll('[data-o-component=o-expander]');
		if (!expanderEls) {
			return;
		}
		for (let i = 0; i < expanderEls.length; i++) {
			expanderInstances.push(new Expander(expanderEls[i]));
		}

		return expanderInstances;
	}
}

export default Expander;