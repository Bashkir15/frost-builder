'use strict';

const { getHashDigest } = require('loader-utils');

const compareModules = (a, b) => {
	if (a.resource < b.resource) {
		return -1;
	}
	if (a.resource > b.resource) {
		return 1;
	}
	return 0;
};

const getSource = module => {
	const source = module._source || {};
	return source._value || '';
};

const concatenateSource = (result, source) => result + source;
const hashType = 'sha256';
const digestType = 'base62';
const digestLength = 8;

class ChunkHash {
	apply(compiler) {
		compiler.plugin('compilation', compilation => {
			compilation.plugin('chunk-hash', (chunk, chunkHash) => {
				const source = chunk
					.mapModules(module => module)
					.sort(compareModules)
					.map(getSource)
					.reduce(concatenateSource, '');
				const hash = getHashDigest(source, hashType, digestType, digestLength);

				chunkHash.digest = function() {
					return hash;
				}
			});
		});
	}
}

module.exports = ChunkHash;
