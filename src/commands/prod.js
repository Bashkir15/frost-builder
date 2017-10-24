'use strict';

const createServer = function() {}

module.exports = (config = {}) => {
	const clientStats = require(`${config.output.client}/stats.json`);
	const serverRender = require(`${config.output.server}/main.js`).default;
	const server = createServer({
		staticConfig: {
			public: config.output.public,
			path: config.output.client,
		},
		afterSecurity: [],
		beforeFallback: [
			serverRender({ clientStats })
		],
		enableNonce: process.env.ENABLE_NONCE !== 'false'
	});

	server.listen(process.env.SERVER_PORT, () => {
		console.log(`Production Server running at Port ${process.env.SERVER_PORT}`);
	});
};
