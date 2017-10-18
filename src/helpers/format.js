'use strict';

const chalk = require('chalk');

const SyntaxLabel = 'Syntax Error';
const SyntaxError = message => message.includes(SyntaxLabel);

const formatRaw = (message, isError) => {
	let lines = message.split('\n');

	if (lines.length > 2 && lines[1] === '') {
		lines.splice(1, 1);
	}

	if (lines[0].lastIndexOf('!') !== -1) {
		lines[0] = lines[0].substr(lines[0].lastIndexOf('!') + 1);
	}

	lines = lines.filter(line => lines.indexOf(' @ ') !== 0);
	if (!lines[0] || !lines[1]) return lines.join('\n');

	if (lines[1].indexOf('Module build failed: ') === 0) {
		lines[1] = lines[1].replace(
			'Module build failed: SyntaxError:',
			SyntaxLabel
		);
	}

	lines[0] = chalk.inverse(lines[0]);
	message = lines.join('\n');
	return message.trim();
};

const formatWebpack = json => {
	const errors = json.errors.map(message => formatRaw(message, true));
	const warnings = json.warnings.map(message => formatRaw(message, false));
	const result = {
		errors,
		warnings
	};

	return result;
};

const formatOutput = (error, stats, target) => {
	if (error) {
		const msg = `Fatal errors during compiling ${target}: ${error}`;
		console.log(chalk.red(msg));
		return Promise.reject(msg);
	}

	const raw = stats.toJson({});
	console.log()
	const messages = formatWebpack(raw);
	const isSuccessful = !messages.errors.length && !messages.warnings.length;
	if (isSuccessful) {
		console.log(chalk.green(`Compiled ${target} successfully`));
	}

	if (messages.errors.length) {
		console.log(chalk.red(`Failed to compile ${target}!\n`));
		console.log(messages.errors.join('\n\n'));
		return Promise.reject(`Failed to compile ${target}\n ${messages.errors.join('\n\n')}`);
	}

	if (messages.warnings.length && !messages.errors.length) {
		console.log(chalk.yellow(`Compiled ${target} with warnings.\n`));
		console.log(messages.warnings.join('\n\n'));
	}

	return Promise.resolve(true);
};

module.exports = formatOutput;
