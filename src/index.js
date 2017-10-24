'use strict';

const { buildClient, buildServer, cleanClient, cleanServer } = require('./commands/build');
const runPrettier = require('./commands/prettier');
const startDevServer = require('./commands/dev');
const startProdServer = require('./commands/prod');
const compiler = require('./compiler');
const notify = require('./notify');

module.exports = {
	buildServer,
	buildClient,
	cleanServer,
	cleanClient,
	startDevServer,
	startProdServer,
	runPrettier,
	compiler,
	notify
};
