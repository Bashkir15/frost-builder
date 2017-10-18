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
		bundleCompression: 'babili',
		uglifyOptions: {
			compress: {
				unsafe_math: true,
				unsafe_proto: true,
				keep_infinity: true,
				passes: 2
			},
			output: {
				ascii_only: true,
				comments: false
			}
		},
		babiliClientOptions: {},
		babiliServerOptions: {
			booleans: false,
			deadcode: true,
			flipComparisons: false,
			mangle: false,
			mergeVars: false
		},
		useCacheLoader: true
	},

	files: {
		babel: /\.(js|mjs|jsx)$/,
		styles: /\.(css|sss|pcss)$/,
		raster: /\.(jpg|png|gif)$/,
		fonts: /\.(eot|svg|otf|ttf|woff|woff2)$/,
	},
};

module.exports = defaults;
