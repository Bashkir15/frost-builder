'use strict';

const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');
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

const clientPlugins = (isDev, isProd, hasHmr) => {
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

	].filter(Boolean)
};

const serverPlugins = (isDev, isProd) => {
	return [
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
		isProd ? new BundleAnalyzerPlugin({
			analyzerMode: 'static',
			defaultSizes: 'parsed',
			logLevel: 'silent',
			openAnalyzer: false,
			reportFilename: 'report.html'
		}) : null
	].filter(Boolean)
};


const managePlugins = (env, webpackTarget, isDev, isProd, isServer, hasHmr) => {
	const base = basePlugins(env, webpackTarget, isDev, isProd);
	const plugins = isServer 
		? base.concat(...serverPlugins(isDev, isProd))
		: base.concat(...clientPlugins(isDev, isProd, hasHmr))
	return plugins;
};

module.exports = managePlugins;
