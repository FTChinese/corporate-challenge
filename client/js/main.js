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

var gallery = new PhotoSwipe(
	document.querySelector('.pswp'), 
	PhotoSwipeUI_Default, 
	[
		{
	        src: 'https://placekitten.com/600/400',
	        w: 600,
	        h: 400
	    },
	    {
	        src: 'https://placekitten.com/1200/900',
	        w: 1200,
	        h: 900
	    }
	], 
	{
	    // optionName: 'option value'
	    // for example:
	    index: 0 // start at first slide
	}
);
gallery.init();