import ContentLoader from './content-loader';

// config.url resource url
class Toggle {
	constructor(toggleEl, config) {
		this.toggleEl = toggleEl;
		const parentNode = toggleEl.parentNode
		this.targetEl = parentNode.querySelector('.o-toggler__target');
		this.containerEl = parentNode;
		this.config = config || {};

		this.isOpen = false;
	}

	toggle() {
		this.isOpen = !this.isOpen;
		if (this.isOpen) {
			this.toggleEl.setAttribute('aria-expanded', 'true');
			this.loadContent();
		} else {
			this.toggleEl.setAttribute('aria-expanded', 'false');
		}
	}

	loadContent() {
		if (!this.targetEl) {
			new ContentLoader(this.containerEl, {
				url: this.config.url,
				className: 'o-toggle__target'
			});
		}
	}
}

export default Toggle;