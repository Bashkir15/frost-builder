'use strict';

const { getHashDigest } = require('loader-utils');

const hashType = 'sha256';
const digestType = 'base62';
const digestLength = 4;

const generateHash = pkg => {
	return getHashDigest(JSON.stringify(pkg), hashType, digestType, digestLength);
};

const cacheHash = (type, pkg, target, env) => {
	const hash = generateHash(pkg);
	return `.cache/${type}-${hash}-${target}-${env}`;
};

module.exports = cacheHash;
