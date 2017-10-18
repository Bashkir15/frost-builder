'use strict';

const { readdirSync } = require('fs');
const { resolve } = require('path');
const { readJsonSync } = require('fs-extra');
const builtinModules = require('builtin-modules');

const root = 'node_modules';

const BuiltIns = new Set(builtinModules);
const Modules = new Set();
const Binaries = new Set();
const Webpack = new Set([
	'react-universal-component',
	'webpack-flush-chunks'
]);

const NodePackages = readdirSync(root).filter(dirname => dirname.charAt(0) !== '.');
NodePackages.forEach(pkg => {
	let json;
	try {
		json = readJsonSync(resolve(root, pkg, 'package.json'));
	} catch (error) {
		return;
	}

	if (json.module || json.style || json['jsnext:main']) {
		Modules.add(pkg);
	}
	if (json.binary != null) {
		Binaries.add(pkg);
	}
});

const Problematic = new Set([
	// 'mime-db' for working with mime types. Pretty large, no reason to bundle all
	'mime-db',

	// 'express' uses some dynamic requires
	'express',

	// 'node-pre-gyp' native code helper
	'node-pre-gyp',

	// Uses dynamics requires
	'jsdom'
]);

console.log('ESM:', Modules);
console.log('Binaries:', Binaries);
console.log('Problematic:', Problematic);

const isLoaderSpecific = req => Boolean(/\.(eot|woff|woff2|ttf|otf|svg|png|jpg|jpeg|gif|webp|webm|ico|mp4|mp3|ogg|html|pdf|swf|css|scss|sass|sss|less)$/.exec(req));

module.exports = () => (context, req, cb) => {
	const basename = req.split('/')[0];

	if (BuiltIns.has(basename)) {
		return cb(null, `commonjs ${req}`);
	}
	if (Binaries.has(basename)) {
		return cb(null, `commonjs ${req}`);
	}
	if (Problematic.has(basename)) {
		return cb(null, `commonjs ${req}`);
	}

	if (basename.charAt(0) === '.') {
		return cb();
	}
	if (Modules.has(basename)) {
		return cb();
	}
	if (Webpack.has(basename)) {
		return cb();
	}
	if (isLoaderSpecific(req)) {
		return cb;
	}

	return cb(null, `commonjs ${req}`);
};

