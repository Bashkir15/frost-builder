'use strict';

const cosmiconfig = require('cosmiconfig');
const getRoot = require('app-root-dir').get;
const { relative, resolve, join } = require('path');
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

const loaders = [
	'hook.webpack'
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
		throw new Error(`Error parsing config file: ${error}. Root: ${Root}`);
	});


const getConfig = async flags => {
	return await configPromise
		.then(config => {
			for (const key in flags) {
				set(config, key, flags[key]);
			}

			if (flags.verbose) {
				console.log('Configuration:');
				jsome(config);
			}

			return config;
		})
		.then(async config => {
			const loadedModules = await Promise.all(
				loaders.map(path => {
					const file = get(config, path);
					if (file) {
						return require(join(Root, file));
					} else {
						return null;
					}
				})
			);

			loaders.forEach((path,index) => {
				const loadedModule = loadedModules[index];
				if (loadedModule) {
					set(config, path, loadedModule.default || loadedModule);
				};
			});

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