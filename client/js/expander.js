import Toggle from './toggle';

class Expander {
	constructor(rootEl, config) {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		this.rootEl = rootEl;
		const toggleMap = {};

		const toggleEls = rootEl.querySelectorAll('.o-toggle');

		for (let i = 0, len = toggleEls.length; i < len; i++) {
			const toggleEl = toggleEls[i]
			const href = toggleEl.href;
			
			toggleMap[href] = new Toggle(toggleEl, {
				url: href
			});
		}
		this.toggleMap = toggleMap;
		
		this.rootEl.addEventListener('click', (e) => {
			this.handleClick(e);
		});
	}

	handleClick(e) {
		const targetEl = e.target;
		if (!targetEl.classList.contains('o-toggle')) {
			return;
		}
		e.preventDefault();

		const href = targetEl.href;

		if (this.toggleMap.hasOwnProperty(href)) {
			this.toggleMap[href].toggle();
		} 
	}

	static init(el) {
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