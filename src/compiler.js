'use strict';

const webpack = require('webpack');
const fs = require('fs');
const { resolve } = require('path');
const getRoot = require('app-root-dir').get;
const chalk = require('chalk');

const { configureCompiler, buildEntryAndOutput } = require('./helpers/compiler');
const removeEmptyKeys = require('./helpers/emptyKeys');

const Root = getRoot();
const pkg = require(resolve(Root, 'package.json'));

module.exports = (target, env = 'development', config = {}) => {
	const {
		isClient,
		isServer,
		isDev,
		isProd,
		name,
		webpackTarget,
	} = configureCompiler(target, env);

	const {
		mainEntry,
		vendorEntry,
		hasMain,
		hasVendor,
		serverOutput,
		clientOutput,
		hasHrm,
		hmrMiddleware,
	} = buildEntryAndOutput(config, isServer, isDev);

	const prefix = chalk.bold(target.toUpperCase());
	const devtool = config.build.enableSourceMaps ? 'source-map' : false;

	console.log(chalk.underline(`${prefix} Configuration`));
	console.log(`→ Environment: ${env}`);
	console.log(`→ WebpackTarget: ${webpackTarget}`);

	if (config.verbose) {
		console.log(`→ Enable Source Maps: ${devtool}`);
	}

	return {
		name,
		devtool,
		target: webpackTarget,
		context: Root,
		entry: removeEmptyKeys({
			vendors: hasVendor ? [
				hasVendor && hasHrm
					? hmrMiddleware
					: null,
			].filter(Boolean) : null,
			main: hasMain ? [
				hasMain && hasHrm
					? hmrMiddleware
					: null,
				mainEntry
			].filter(Boolean) : null
		}),
		output: {
			libraryTarget: isServer ? 'commonjs2' : 'var',
			filename: isDev || isServer
				? '[name].js'
				: '[name]-[chunkhash].js',
			chunkFilename: isDev || isServer
				? '[name].js'
				: '[name]-[chunkhash].js',
			path: isServer ? serverOutput : clientOutput,
			publicPath: config.output.public,
			crossOriginLoading: 'anonymous'
		},

		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					loader: 'source-map-loader',
					enforce: 'pre',
					options: {
						quiet: true
					},
				},
				{
					test: /\.(js|jsx)$/,
					use: {
						loader: 'babel-loader'
					}
				}
			]
		},

		plugins: [
			new webpack.DefinePlugin({
				'process.env.': {
					'NODE_ENV': JSON.stringify(env),
					'TARGET': JSON.stringify(target)
				}
			}),

			isDev ? new webpack.NoEmitOnErrorsPlugin() : null,
		].filter(Boolean)
	};
};
