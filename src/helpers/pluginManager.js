'use strict';

const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const StatsPlugin = require('stats-webpack-plugin');

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

const clientPlugins = (isDev, isProd) => {
	return [
		isProd ? new StatsPlugin('stats.json') : null
	].filter(Boolean)
};

const serverPlugins = (isDev, isProd) => {
	return [
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
	];
};


const managePlugins = (env, webpackTarget, isDev, isProd, isServer) => {
	const base = basePlugins(env, webpackTarget, isDev, isProd);
	const plugins = isServer 
		? base.concat(...serverPlugins(isDev, isProd))
		: base.concat(...clientPlugins(isDev, isProd))
	return plugins;
};

module.exports = managePlugins;
