'use strict';

const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
const UglifyPlugin = require('uglifyjs-webpack-plugin');
const BabiliMinifyPlugin = require('babel-minify-webpack-plugin');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const basePlugins = (env, webpackTarget, isDev, isProd) => {
	return [
		new webpack.DefinePlugin({
			'process.env.': {
				'NODE_ENV': JSON.stringify(env),
				'TARGET': JSON.stringify(webpackTarget)
			}
		}),

		new CaseSensitivePathsPlugin(),

		isDev ? new webpack.NamedModulesPlugin() : null,
		isDev ? new webpack.NoEmitOnErrorsPlugin() : null,
		isProd ? new webpack.HashedModuleIdsPlugin() : null,
	].filter(Boolean)
};

const clientPlugins = (isDev, isProd, hasHmr, build, uglifyCache) => {
	return [
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
			: null
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


const managePlugins = (env, webpackTarget, isDev, isProd, isServer, hasHmr, { build }, uglifyCache) => {
	const base = basePlugins(env, webpackTarget, isDev, isProd);
	const plugins = isServer 
		? base.concat(...serverPlugins(isDev, isProd, build))
		: base.concat(...clientPlugins(isDev, isProd, hasHmr, build, uglifyCache))
	return plugins;
};

module.exports = managePlugins;
