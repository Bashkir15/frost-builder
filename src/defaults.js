'use strict';

const defaults = {
	entry: {
		client: 'client/index.js',
		server: 'server/index.js'
	},

	output: {
		client: 'build/client',
		server: 'build/server',
		public: '/static/',
	},

	babelOptions: {
		presets: [],
		plugins: []
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
		hasServiceWorker: false,
		serviceWorkerEntry: 'client/sw.js',
		useCacheLoader: true,
		useEslint: true,
		usePostCss: true
	},

	performance: {},
	files: {
		babel: /\.(js|mjs|jsx)$/,
		styles: /\.(css|sss|pcss)$/,
		raster: /\.(jpg|png|gif)$/,
		fonts: /\.(eot|svg|otf|ttf|woff|woff2)$/,
		yaml: /\.(yml|yaml)$/,
		graphql: /\.(graphql|gql)$/
	},
};

module.exports = defaults;
