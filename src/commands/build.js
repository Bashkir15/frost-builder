'use strict';

const webpack = require('webpack');
const chalk = require('chalk');

const { remove } = require('fs-extra');

const compiler = require('../compiler');
const { promisify } = require('../helpers/promise');

const removePromise = promisify(remove);

const buildClient = (config = {}) => {
	const webpackConfig = compiler('client', 'production', config);
	return new Promise((resolve, reject) => {
		webpack(webpackConfig, (fatalError, stats) => {
			if (fatalError) {
				const msg = `Error during compiling client: ${fatalError}`;
				console.log(chalk.red(msg));
				return reject(msg);
			}

			return resolve(true);
		});
	});
};

const buildServer = (config = {}) => {
	const webpackConfig = compiler('server', 'production', config);
	return new Promise((resolve, reject) => {
		webpack(webpackConfig, (fatalError, stats) => {
			if (fatalError) {
				const msg = `Error during compiling server: ${fatalError}`;
				console.log(chalk.red(msg));
				return reject(msg);
			}

			return resolve(true);
		});
	});
};

const cleanClient = (config = {}) => {
	return removePromise(config.output.client);
};

const cleanServer = (config = {}) => {
	return removePromise(config.output.server);
};

module.exports = {
	buildClient,
	buildServer,
	cleanServer,
	cleanClient
};

