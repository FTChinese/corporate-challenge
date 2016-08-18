import Share from 'ftc-share';
import Expander from './expander';
import ContentLoader from './content-loader';
import { updateYear } from './util';

Share.init();
Expander.init('#main');

updateYear('.o-footer__year');


try {
	var mySwiper = new Swiper('.swiper-container', {
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



console.log('test webpack');