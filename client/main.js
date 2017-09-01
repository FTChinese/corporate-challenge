import 'Swiper';
import Share from 'ftc-share';
import Expander from './js/expander';

Share.init();
Expander.init('#main');

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
