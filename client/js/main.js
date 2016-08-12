import Share from 'ftc-share';

Share.init();
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