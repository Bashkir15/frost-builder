'use strict';

const chalk = require('chalk');
const glob = require('glob');
const path = require('path');
const getRoot = require('app-root-dir').get;
const { execFileSync } = require('child_process');

const Root = getRoot();
const isWindows = process.platform === 'win32';
const prettier = isWindows ? 'prettier.cmd' : 'prettier';
const prettierCmd = path.resolve(
	Root,
	`node_modules/.bin/${prettier}`
);

const defaultOptions = {
	'bracket-spacing': 'false',
	'single-quote': 'true',
	'jsx-bracket-same-line': 'true',
	'trailing-comma': 'all',
	'print-width': 80
};

const defaultConfig = {
	src: {
		patterns: ['client/**/*.js', 'server/**/*.js'],
		ignore: [ '**/node_modules/**' ]
	}
};

const exec = (command, args) => {
	console.log(`→ ${[command].concat(args).join(' ')}`);
	const options = {
		cwd: process.cwd(),
		env: process.env,
		stdio: 'pipe',
		encoding: 'utf-8'
	};

	return execFileSync(command, args, options);
};

module.exports = ({ prettierOptions, prettierPatterns}, mode) => {
	const shouldWrite = mode === 'write' || mode === 'write-changed';
	const onlyChanged = mode === 'check-changed' || mode === 'write-changed';	
	console.log(mode);
	const config = prettierPatterns
		? prettierPatterns
		: defaultConfig;
	const formatConfig = prettierOptions
		? prettierOptions
		: defaultOptions;

	Object.keys(config).forEach(key => {
		const patterns = config[key].patterns;
		const options = config[key].options;
		const ignore = config[key].ignore;
		const globPattern = patterns.length > 1
			? `{${patterns.join(',')}}`
			: `${patterns.join(',')}`;
		const files = glob
			.sync(globPattern, {ignore})

		console.log(globPattern);
		console.log(files);

		if (!files.length) {
			return;
		}

		const args = Object.keys(formatConfig).map(
			k => `--${k}=${(options && options[k]) || formatConfig[k]}`
		);
		args.push(`--${shouldWrite ? 'write' : 'l'}`);

		try {
			exec(prettierCmd, [...args, ...files]).trim();
		} catch (e) {
			if (!shouldWrite) {
				process.exit(1);
			}

			throw e;
		}
	});
};
