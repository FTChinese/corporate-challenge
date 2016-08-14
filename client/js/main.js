import Share from 'ftc-share';
import Expander from './expander';
import ContentLoader from './content-loader';
import { merge, updateYear } from './util';
Share.init();
new ContentLoader('.top-stories__wrapper', {
	className: 'to-story__article'
});

Expander.init();

updateYear('.o-footer__year');