'use strict';

const { buildClient, buildServer, cleanClient, cleanServer } = require('./commands/build');
const runPrettier = require('./commands/prettier');

module.exports = {
	buildServer,
	buildClient,
	cleanServer,
	cleanClient,
	runPrettier
};
