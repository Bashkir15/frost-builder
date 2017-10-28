'use strict';

const path = require('path');
const steed = require('steed');

const resolveImageSrc = (ctx, img, cb) => {
	if (typeof img.src !== 'string') {
		return cb(new Error('Missing img "src" property in manifest'));
	}

	const publicPath = ctx.options.output.publicPath || '';
	const dirname = path.dirname(ctx.resourcePath);

	// Resolve the image filename relative to manifest file
	ctx.resolve(dirname, img.src, (err, fileName) => {
		if (err) {
			return cb(err);
		}

		// Ensure webpack knows the that image is a dependency of the manifest
		ctx.dependency && ctx.dependency(fileName);

		// Async pass the image through the loader pipeline
		ctx.loadModule(fileName, (err, source, map, module) => {
			if (err) {
				return cb(err);
			}
			img.src = publicPath + Object.keys(module.assets)[0];
			cb(null);
		});
	});
};

const resolveImages = (ctx, manifest, key, cb) => {
	if (!Array.isArray(manifest[key])) {
		return cb(null);
	}

	return steed.map(manifest[key], resolveImageSrc.bind(null, ctx), (err) => {
		if (err) {
			return cb(err);
		}
		cb(null);
	});
};

module.exports = source => {
	const ctx = this;
	const cb = ctx.async();
	let manifest;

	try {
		manifest = JSON.parse(source);
	} catch (err) {
		return cb(new Error('Invalid JSON in manifest'));
	}

	steed.parallel(
		[
			resolveImages.bind(null, ctx, manifest, 'splash_screens'),
			resolveImages.bind(null, ctx, manifest, 'icons')
		],
		(err) => {
			if (err) {
				return cb(err);
			}

			cb(null, JSON.stringify(manifest, null, 2))
		}
	)
};
