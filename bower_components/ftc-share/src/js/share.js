const socialUrls = {
	wechat: {
		name: "微信",
		url: "http://www.ftchinese.com/m/corp/qrshare.html?title={{title}}&url={{url}}&ccode=2C1A1408"
	},
	weibo: {
		name: "微博",
		url: "http://service.weibo.com/share/share.php?&appkey=4221537403&url={{url}}&title=【{{title}}】{{summary}}&ralateUid=1698233740&source=FT中文网&sourceUrl=http://www.ftchinese.com/&content=utf8&ccode=2G139005"
	},
	linkedin: {
		name: "领英",
		url: "http://www.linkedin.com/shareArticle?mini=true&url={{url}}&title={{title}}&summary={{summary}}&source=FT中文网"
	},
	facebook: {
		name: "Facebook",
		url: "http://www.facebook.com/sharer.php?u={{url}}"
	},
	twitter: {
		name: "Twitter",
		url: "https://twitter.com/intent/tweet?url={{url}}&amp;text=【{{title}}】{{summary}}&amp;via=FTChinese"
	}
};

function getOgContent(metaEl) {
	if (!(metaEl instanceof HTMLElement)) {
		metaEl = document.querySelector(metaEl);
	}
	return metaEl.hasAttribute('content') ? metaEl.getAttribute('content') : '';
}

// Get page meta content statically. Should not put this inside the `Share` object in order to reduce DOM traverse.
const defaultConfig = {
	links: ['wechat', 'weibo', 'linkedin', 'facebook', 'twitter'],

	url: window.location.href || '',
	summary: getOgContent('meta[property="og:description"]'),
	title: getOgContent('meta[property="og:title"]')
};

class Share {
	constructor(rootEl, config) {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		rootEl.setAttribute('data-o-share--js', '');

		this.rootEl = rootEl;
		if (!config) {
			config = {};
			config.links = rootEl.hasAttribute('data-o-share-links') ? rootEl.getAttribute('data-o-share-links').split(' ') : defaultConfig.links;
			config.url = rootEl.getAttribute('data-o-share-url') || defaultConfig.url;
			config.title = rootEl.getAttribute('data-o-share-title') || defaultConfig.title;
			config.summary = rootEl.getAttribute('data-o-share-summary') || defaultConfig.summary;
		}
		this.config = config;
		this.openWindows = {};

		if (rootEl.children.length === 0) {
			this.render();
			this.addClickEvent();
		}
	}

	render() {
		const ulElement = document.createElement('ul');

		for (let i = 0, len = this.config.links.length; i < len; i++) {
			const link = this.config.links[i];
			const linkName = socialUrls[link].name;
			
			const liElement = document.createElement('li');

			liElement.className = 'o-share__action o-share__' + link;
			
			const aElement = document.createElement('a');

			aElement.href = this.generateSocialUrl(link);
			aElement.setAttribute('title', '分享到'+linkName);
			
			const iElement = document.createElement('i');
			iElement.innerHTML = linkName;
			aElement.appendChild(iElement);

			liElement.appendChild(aElement);
			ulElement.appendChild(liElement);
		}
		this.rootEl.appendChild(ulElement);
	}

	addClickEvent() {
		this.rootEl.addEventListener('click', (e) => {
			var target = e.target;
			e.preventDefault();
			while (target.nodeName.toLowerCase() !== 'a') {
				target = target.parentNode
			}
			this.shareSocial(target.href);
		});
	}

	shareSocial(url) {
		if (url) {
			if (this.openWindows[url] && !this.openWindows[url].closed) {
				this.openWindows[url].focus();
			} else {
				this.openWindows[url] = window.open(url, '', 'width=646,height=436');
			}
		}
	}

	generateSocialUrl (socialNetwork) {
		let templateUrl = socialUrls[socialNetwork].url;
		templateUrl = templateUrl.replace('{{url}}', encodeURIComponent(this.config.url))
			.replace('{{title}}', encodeURIComponent(this.config.title))
			.replace('{{summary}}', encodeURIComponent(this.config.summary));

		return templateUrl;
	}

	static init(el) {
		const shareInstances = [];

		if (!el) {
			el =document.body;
		} else if (!el instanceof HTMLElement) {
			el = document.querySelector(el);
		}

		const shareElements = el.querySelectorAll('[data-o-component=o-share]');

		for (let i = 0; i < shareElements.length; i++) {
			shareInstances.push(new Share(shareElements[i]));

		}

		return shareInstances;
	}
}

export default Share;