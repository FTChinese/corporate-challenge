PATH := node_modules/.bin:$(PATH)
SHELL := /bin/bash

serve : .tmp/styles/main.css .tmp/scripts/main.js
	browser-sync start --server '.tmp' --serveStatic 'public' --file 'public'


.tmp/styles/main.css : client/scss/main.scss
	mkdir -p .tmp/styles
	node-sass --include-path bower_components client/scss/main.scss .tmp/styles/main.css


.tmp/scripts/main.js : client/js/main.js
	mkdir -p .tmp/scripts
	webpack

clean :
	rm -r .tmp