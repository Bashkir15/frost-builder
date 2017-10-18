'use strict';

const ora = require('ora');
const getRoot = require('app-root-dir').get;
const { relative } = require('path');

const Root = getRoot();

class Progress {
	constructor({ prefix }) {
		this.prefix = prefix;
	}

	apply(compiler) {
		let doneCount = 0;
		let spinner = null;
		let last = null;
		const prefix = this.prefix
			? this.prefix + ' '
			: '';

		function display(message) {
			if (message !== '') {
				spinner.text = prefix + message;
				spinner.render();
			} else {
				spinner.succeed(prefix + 'Done!');
			}
		}

		function moduleDone(module) {
			doneCount += 1;

			let index;
			let id = last;

			index = id.lastIndexOf(' ');
			id = index === -1
				? id
				: id.slice(index + 1, id.length);

			index = id.lastIndexOf('!');
			id = index === -1
				? id
				: id.slice(index + 1, id.length);

			index = id.indexOf('?');
			id = index === -1
				? id
				: id.slice(0, index);

			id = relative(Root, id).replace(/^node_modules\//, '~/');

			if (id.startsWith('"') && id.endsWith('"')) {
				id = id.slice(1, -1);
			}

			if (id.includes('|')) return;
			if (id.startsWith('..')) return;
			if (/^[a-zA-Z0-9\-_/~\.]{0,50}$/.test(id)) {
				display(`Building Modules ${id}...`);
			}
		}

		compiler.plugin('compilation', compilation => {
			if (compilation.compiler.isChild()) return;

			doneCount = 0;
			spinner = ora({ interval: 16 });
			spinner.start();

			display(0, 'compiling');

			compilation.plugin('build-module', module => {
				last = module.identifier();
			});
			compilation.plugin('failed-module', moduleDone);
			compilation.plugin('success-module', moduleDone);

			const syncHooks = {
				'seal': 'Sealing',
				'optimize': 'Optimizing',
				'optimize-modules-basic': 'Optimizing Modules',
				'optimize-chunks-basic': 'Optimizing chunks',
				'optimize-chunk-modules': 'Optimizing chunk modules',
				'optimize-module-order': 'Optimizing module order',
				'optimize-module-ids': 'Optimizing module ids',
				'optimize-chunk-order': 'Optimizing chunk order',
				'optimizing-chunk-ids': 'Optimizing chunk ids',
				'before-hash': 'Hashing',
				'before-module-assets': 'Processing module assets',
				'before-chunk-assets': 'Processing chunk assets',
				'record': 'Recording'
			};

			Object.keys(syncHooks).forEach(name => {
				let pass = 0;
				const message = syncHooks[name];
				compilation.plugin(name, () => {
					if (pass++ > 0) {
						display(message + ` [pass ${pass}]`);
					} else {
						display(message);
					}
				});
			});

			compilation.plugin('optimize-tree', (chunks, modules, cb) => {
				display('Optimizing tree');
				cb();
			});

			compilation.plugin('additional-assets', cb => {
				display('Processing assets');
				cb();
			});

			compilation.plugin('optimize-chunk-assets', (chunks, cb) => {
				display('Optimizing chunk assets');
				cb();
			});

			compilation.plugin('optimize-assets', (assets, cb) => {
				display('Optimizing assets');
				cb();
			});
		});

		compiler.plugin('emit', (compilation, cb) => {
			display('Emitting');
			cb();
		});

		compiler.plugin('done', () => {
			display('');
		});
	}
}

module.exports = Progress;