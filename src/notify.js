'use strict';

const chalk = require('chalk');
const notifier = require('node-notifier');

module.exports = options => {
	const title = `${options.title}`;

	if (options.notify) {
		notifier.notify({
			title,
			message: options.message
		});
	}

	const level = options.level || 'info';
	const message = `${chalk.bold(title)}: ${options.message}`;

	switch (level) {
		case 'warn':
			console.log(chalk.yellow(message));
			break;
		case 'error':
			console.log(chalk.red(message));
			break;
		case 'info':
		default:
			console.log(chalk.cyan(message));
	}
};