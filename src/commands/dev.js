'use strict';

const chalk = require('chalk');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackHotServerMiddleware = require('webpack-hot-server-middleware');
const createServer = function() {};

const compiler = require('../compiler');
const formatOutput = require('../helpers/format');

const startDevServer = (config = {}) => {
	console.log(config);
	const clientConfig = compiler('client', 'development', config);
	const serverConfig = compiler('server', 'development', config);
	const multiCompiler = webpack([ clientConfig, serverConfig ]);
	const clientCompiler = multiCompiler.compilers[0];

	const devMiddleware = webpackDevMiddleware(multiCompiler, {
		publicPath: config.output.public,
		quiet: true,
		noInfo: true
	});

	const hotMiddleware = webpackHotMiddleware(clientCompiler);
	const hotServerMiddleware = webpackHotServerMiddleware(multiCompiler, {
		serverRendererOptions: {
			outputPath: config.output.client
		}
	});

	const server = createServer({
		staticConfig: {
			public: config.output.public,
			path: config.output.client
		},
		afterSecurity: [],
		beforeFallback: [
			devMiddleware,
			hotMiddleware,
			hotServerMiddleware
		],
		enableNonce: process.env.ENABLE_NONCE !== 'false'
	});

	let serverIsStarted = false;

	multiCompiler.plugin('invalid', () => console.log('Compiling...'));
	multiCompiler.plugin('done', stats => {
		return formatOutput(false, stats, 'dev-server')
			.then(() => {
				if (!stats.hasErrors() && !serverIsStarted) {
					serverIsStarted = true;
					server.listen(process.env.SERVER_PORT, () => {
						console.log(`Development server started at port ${process.env.SERVER_PORT}`);
					});
				}
			});
	});
};

module.exports = startDevServer;
