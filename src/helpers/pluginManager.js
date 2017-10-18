'use strict';

const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const UglifyPlugin = require('uglifyjs-webpack-plugin');
const BabiliMinifyPlugin = require('babel-minify-webpack-plugin');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');
const ServiceWorkerPlugin = require('serviceworker-webpack-plugin');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const MissingModulesPlugin = require('../plugins/MissingModules');
const ChunkHashPlugin = require('../plugins/ChunkHash');
const ProgressPlugin = require('../plugins/Progress');

const basePlugins = (env, webpackTarget, isDev, isProd) => {
	return [
		new webpack.DefinePlugin({
			// These need to be kept separate to allow use
			// with libraries like dotenv
			'process.env.NODE_ENV': JSON.stringify(env),
			'process.env.TARGET': JSON.stringify(webpackTarget)
		}),

		process.stdout.isTTY ? new ProgressPlugin({
			prefix: 'frost'
		}) : null,

		// Improves OS compatibilit
		// See: https://github.com/Urthen/case-sensitive-paths-webpack-plugin
		new CaseSensitivePathsPlugin(),

		isDev ? new webpack.NamedModulesPlugin() : null,
		isDev ? new webpack.NoEmitOnErrorsPlugin() : null,

		// Will generate IDs that will persist over builds
		isProd ? new webpack.HashedModuleIdsPlugin() : null,
		
		// This is used to guarentee that our generated [chunkhash]'s are different ONLY
		// if the content for the respective chunks have changed. This allows for maximization
		// of a long-term browser caching strategy for the client bundle, avoiding cases
		// where browsers end up having to download all of the chunks again even though
		// only one or two may have changed
		isProd ? new ChunkHashPlugin() : null,
		isProd ? new webpack.optimize.ModuleConcatenationPlugin() : null,
	].filter(Boolean)
};

const clientPlugins = (isDev, isProd, hasHmr, build, uglifyCache, hasVendor) => {
	return [
		hasVendor ? new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor',
			children: true,
			minChunks: 2,
			async: true
		}) : null,
		new ExtractCssChunks({
			filename: isDev
				? '[name].css'
				: '[name]-[contenthash:base62:8].css'
		}),
		isDev ? new MissingModulesPlugin() : null,
		isProd ? new SriPlugin({
			hashFuncNames: [ 'sha256', 'sha512' ],
			enabled: true
		}) : null,
		isProd ? new StatsPlugin('stats.json') : null,
		isProd ? new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			defaultSizes: 'gzip',
			logLevel: 'silent',
			openAnalyzer: false,
			reportFilename: 'report.html'
		}) : null,
		isDev && hasHmr ? new webpack.HotModuleReplacementPlugin() : null,
		isProd && build.bundleCompression === 'uglify' ?
			new UglifyPlugin({
				sourcemap: build.enableSourceMaps,
				parallel: {
					cache: uglifyCache
				},
				uglifyOptions: build.uglifyOptions
			}) : null,
		isProd && build.bundleCompression === 'babili' ? 
			new BabiliMinifyPlugin(build.babiliClientOptions, { comments: false })
			: null,

		build.hasServiceWorker ? new ServiceWorkerPlugin({
			entry: build.serviceWorkerEntry,
			excludes: ['*hot-update', '**/*.map', '**/stats.json']
		}) : null
	].filter(Boolean)
};

const serverPlugins = (isDev, isProd, build) => {
	return [
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
		isProd ? new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			defaultSizes: 'parsed',
			logLevel: 'silent',
			openAnalyzer: false,
			reportFilename: 'report.html'
		}) : null,
		isProd ? new BabiliMinifyPlugin(build.babiliServerOptions, { comments: false }) : null
	].filter(Boolean)
};


const managePlugins = (env, webpackTarget, isDev, isProd, isServer, hasHmr, { build }, uglifyCache, hasVendor) => {
	const base = basePlugins(env, webpackTarget, isDev, isProd);
	const plugins = isServer 
		? base.concat(...serverPlugins(isDev, isProd, build))
		: base.concat(...clientPlugins(isDev, isProd, hasHmr, build, uglifyCache))
	return plugins;
};

module.exports = managePlugins;
