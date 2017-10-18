'use strict';

const meow = require('meow');
const chalk = require('chalk');

const { Root, getConfig } = require('./config');
const { buildClient, buildServer, cleanClient, cleanServer } = require('./commands/build');
const runPrettier = require('./commands/prettier');
const { each } = require('./helpers/promise');
const { clearConsole } = require('./helpers/console');

const isInteractive = process.stdout.isTTY;
if (isInteractive) {
	clearConsole();
}

const cli = meow(`
	Usage:
		$ frost <command>

	Options:
		--verbose, -v
		--quiet, -q

	Commands:
		build
		build:client
		build:server
		clean
`, {
	alias: {
		v: 'verbose',
		q: 'quiet'
	}
});

const input = cli.input;
const flags = cli.flags;

const tasks = [
	{ task: 'clean', commands: [ cleanClient, cleanServer ]},
	{ task: 'build', commands: [ cleanClient, cleanServer, buildClient, buildServer ]},
	{ task: 'build:client', commands: [ cleanClient, buildClient ]},
	{ task: 'build:server', commands: [ cleanServer, buildServer ]},
	{ task: 'prettier', commands: [ runPrettier ]},
	{ task: 'prettier:all', commands: [ runPrettier ]},
	{ task: 'prepare', commands: [ cleanClient, cleanServer, buildClient, buildServer, runPrettier ]}
];

if (!flags.verbose) {
	process.noDeprecation = true;
}

function execute(commands, config, mode) {
	return each(commands, (item) => item(config, mode));
}

async function executeTasks() {
	const config = await getConfig(flags);
	for (const name of input) {
		for (const task of tasks) {
			if (task.task === name) {
				let mode;
				if (name === 'prettier') {
					mode = 'write';
				}
				if (name === 'prettier:all' || name === 'prepare') {
					mode = 'write-changed';
				}

				try {
					await execute(task.commands, config, mode);
				} catch (error) {
					console.error(chalk.bold.red(`Failed to execute task: ${name}!`));
					console.error(error);
					process.exit(1);
				}
			}
		}
	}
}

if (input.length > 0) {
	process.nextTick(executeTasks);
} else {
	command.showHelp();
}
