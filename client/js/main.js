import Share from 'ftc-share';
import Expander from './expander';

Share.init();
Expander.init('#main');

updateYear('.o-footer__year');


try {
	new Swiper('.swiper-container', {
		pagination: '.swiper-pagination',
		nextButton: '.swiper-button-next',
		prevButton: '.swiper-button-prev',
		lazyLoadingInPrevNext: true,
		preloadImages: false,
		lazyLoading: true,
		paginationClickable: true
	});		
} catch (err) {
	//console.log(err);
}

function updateYear(rootEl) {
	if (!rootEl) {
		rootEl = document.body;
	} else if (!(rootEl instanceof HTMLElement)) {
		rootEl = document.querySelector(rootEl);
	}

	var year = new Date().getFullYear();
	rootEl.textContent = year;
	return year;
}
