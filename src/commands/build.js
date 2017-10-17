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
			return formatOutput(fatalError, stats, 'client')
				.catch(err => console.error(err));
		});
	});
};

const buildServer = (config = {}) => {
	const webpackConfig = compiler('server', 'production', config);
	return new Promise((resolve, reject) => {
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

module.exports = {
	buildClient,
	buildServer,
	cleanServer,
	cleanClient
};

