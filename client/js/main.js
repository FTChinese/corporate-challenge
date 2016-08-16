import Share from 'ftc-share';
import Expander from './expander';
import ContentLoader from './content-loader';
import { updateYear } from './util';


Share.init();
Expander.init('#main');
// new ContentLoader('.top-stories__wrapper', {
// 	className: 'top-story__article'
// });

// Expander.init();

updateYear('.o-footer__year');

var mySwiper = new Swiper('.swiper-container', {
	pagination: '.swiper-pagination',
	nextButton: '.swiper-button-next',
	prevButton: '.swiper-button-prev',
	lazyLoadingInPrevNext: true,
	preloadImages: false,
	lazyLoading: true,
	paginationClickable: true
});