'use strict';

const cosmiconfig = require('cosmiconfig');
const getRoot = require('app-root-dir').get;
const { relative, resolve } = require('path');
const { get, set, defaultsDeep } = require('lodash');
const chalk = require('chalk');
const jsome = require('jsome');

const defaults = require('./defaults');

const Root = getRoot();
const resolveFor = [
	'entry.client',
	'entry.server',
	'entry.clientVendor',
	'output.server',
	'output.client'
];

const configLoader = cosmiconfig('frost', {
	stopDir: Root
});

const configPromise = configLoader
	.load(Root)
	.then(results => {
		if (typeof results !== 'object' || results === null || results.filepath === null) {
			throw new Error(`Invalid loader results: ${results}`);
		}

		console.log(`Loaded configuration from ${relative(Root, results.filepath)}`);
		const merged = defaultsDeep(results.config, defaults);
		return resolveConfigPaths(merged);
	})
	.catch(error => {

	});

const getConfig = async flags => {
	return await configPromise
		.then(config => {
			for (const key in flags) {
				set(config, key, flags[key]);
			}

			return config;
		})
};

const resolveConfigPaths = config => {
	resolveFor.forEach(entry => {
		if (get(config, entry) != null) {
			set(config, entry, resolve(Root, get(config, entry)));
		}
	});

	return config;
};

module.exports = {
	Root,
	getConfig
};