'use strict';

const { buildClient, buildServer, cleanClient, cleanServer } = require('./commands/build');

module.exports = {
	buildServer,
	buildClient,
	cleanServer,
	cleanClient
};
