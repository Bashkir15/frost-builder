'use strict';

const defaults = {
	entry: {
		client: 'client/index.js',
		server: 'server/index.js'
	},

	output: {
		client: 'build/client',
		server: 'build/server'
	},

	build: {
		enableSourceMaps: true,
	},

	files: {
		babel: /\.(js|mjs|jsx)$/,
		styles: /\.(css|sss|pcss)$/,
		raster: /\.(jpg|png|gif)$/,
		fonts: /\.(eot|svg|otf|ttf|woff|woff2)$/,
	}
};

module.exports = defaults;
