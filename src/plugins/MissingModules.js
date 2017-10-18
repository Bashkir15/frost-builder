'use strict';

class MissingModules {
	constructor(path) {
		this.path = path;
	}

	apply(compiler) {
		compiler.plugin('emit', (compilation, cb) => {
			const missing = compilation.missingDependencies;
			const path = this.path;
			if (missing.some(file => file.indexOf(path) !== -1)) {
				compilation.contextDependencies.push(path);
			}

			cb();
		});
	}
}

module.exports = MissingModules;
