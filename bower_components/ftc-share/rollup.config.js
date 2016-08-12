import buble from 'rollup-plugin-buble';

export default {
	entry: './src/js/share.js',
	dest: 'dist/ftc-share.js',
	plugins: [
		buble()
	],
	format: 'iife'
};