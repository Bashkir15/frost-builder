'use strict';

const webpack = require('webpack');
const chalk = require('chalk');

const { remove } = require('fs-extra');

const compiler = require('../compiler');
const { promisify } = require('../helpers/promise');
const formatOutput = require('../helpers/format');
const removePromise = promisify(remove);


const buildClient = (config = {}) => {
	const webpackConfig = compiler('client', 'production', config);
	return new Promise((resolve, reject) => {
		webpack(webpackConfig, (fatalError, stats) => {
			return resolve(formatOutput(fatalError, stats, 'client'))
		});
	});
};

const buildServer = (config = {}) => {
	const webpackConfig = compiler('server', 'production', config);
	return new Promise((resolve, reject) => {
		// no need to force resolve the promise
		// here like with buildClient because buildClient
		// will always run first
		webpack(webpackConfig, (fatalError, stats) => {
			return formatOutput(fatalError, stats, 'server');
		});
	});
};

const cleanClient = (config = {}) => {
	return removePromise(config.output.client);
};

const cleanServer = (config = {}) => {
	return removePromise(config.output.server);
};

const buildAll = async (config = {}) => {
	await cleanClient(config);
	await cleanServer(config);
	await buildClient(config);
	await buildServer(config);
}
module.exports = {
	buildClient,
	buildServer,
	cleanServer,
	cleanClient,
	buildAll
};

