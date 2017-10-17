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
	}
};

module.exports = defaults;
