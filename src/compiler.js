'use strict';

const webpack = require('webpack');
const fs = require('fs');
const { resolve } = require('path');
const getRoot = require('app-root-dir').get;
const chalk = require('chalk');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');

const { configureCompiler, buildEntryAndOutput } = require('./helpers/compiler');
const removeEmptyKeys = require('./helpers/emptyKeys');
const pluginManager = require('./helpers/pluginManager');
const cacheHash = require('./helpers/hash');
const getExternals = require('./helpers/getExternals');

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

	const loaderCache = resolve(Root, cacheHash('loader', pkg, target, env));
	const uglifyCache = resolve(Root, cacheHash('uglify', pkg, target, env));

	const cacheLoader = config.build.useCacheLoader ? {
		loader: 'cache-loader',
		options: {
			cacheDirectory: loaderCache
		}
	} : null;

	const cssLoaderOptions = {
		modules: true,
		localIdentName: '[local]-[hash:base62:8]',
		minimize: false,
		sourceMap: config.build.enableSourceMaps
	};

	const plugins = pluginManager(env, webpackTarget, isDev, isProd, isServer, hasHrm, config, uglifyCache);

	console.log(chalk.underline(`${prefix} Configuration`));
	console.log(`→ Environment: ${env}`);
	console.log(`→ WebpackTarget: ${webpackTarget}`);

	if (config.verbose) {
		console.log(`→ Enable Source Maps: ${devtool}`);
		console.log(`→ Bundle Compression: ${config.build.bundleCompression}`);
		console.log(`→ Use Cache Loader: ${config.build.useCacheLoader} [Hash: ${loaderCache}]`);
	}

	return {
		name,
		devtool,
		target: webpackTarget,
		context: Root,
		performance: config.performance || {},
		externals: isServer ? getExternals() : undefined,
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
					test: config.files.babel,
					loader: 'source-map-loader',
					enforce: 'pre',
					options: {
						quiet: true
					},
				},
				{
					test: config.files.babel,
					use: [
						cacheLoader,
						{
							loader: 'babel-loader',
							options: config.babelOptions
						}
					].filter(Boolean)
				},
				{
					test: config.files.styles,
					use: isClient ? ExtractCssChunks.extract({
						use: [
							cacheLoader,
							{
								loader: 'css-loader',
								options: cssLoaderOptions
							}
						].filter(Boolean)
					}) : [
						cacheLoader,
						{
							loader: 'css-loader/locals',
							options: cssLoaderOptions
						}
					].filter(Boolean)
				},
				{
					test: config.files.raster,
					use: [
						'file-loader',
						{
							loader: 'image-webpack-loader',
							options: {
								progressive: true,
								optimizationLevel: 7,
								interlaced: false,
								pngquant: {
									quality: '65-90',
									speed: 4
								}
							}
						}
					]
				},
				{
					test: /\.(mp4|webm)$/,
					use: {
						loader: 'url-loader',
						options: {
							limit: 10000,
						}
					}
				},
				{
					test: config.files.fonts,
					loader: 'file-loader',
					options: {
						name: isProd
							? 'file-[hash:base62:8].[ext]'
							: '[path][name].[ext]',
						emitFile: isClient
					}
				},
				{
					test: config.files.yaml,
					loaders: [ 'json-loader', 'yaml-loader' ]
				},
			]
		},

		plugins: [
			...plugins
		].filter(Boolean)
	};
};
