'use strict';

const meow = require('meow');
const chalk = require('chalk');
const updateNotifier = require('update-notifier');

const { Root, getConfig } = require('./config');
const { buildClient, buildServer, cleanClient, cleanServer, buildAll } = require('./commands/build');
const runPrettier = require('./commands/prettier');
const startDevServer = require('./commands/dev');
const startProdServer = require('./commands/prod');
const { each } = require('./helpers/promise');
const { clearConsole } = require('./helpers/console');

const pkg = require('../package.json');
const appPkg = require(Root + '/package.json');

const isInteractive = process.stdout.isTTY;
if (isInteractive) {
	//clearConsole();
}

const appInfo = `running on ${chalk.bold.blue(appPkg.name)}-${appPkg.version}`;

console.log(chalk.bold(`Frost ${chalk.green(`v ${pkg.version}`)} ${appInfo}`));

updateNotifier({
	pkg,
	updateCheckInterval: 1000 * 60 * 60
}).notify();

const cli = meow(`
	Usage:
		$ frost <command>

	Options:
		--verbose, -v      Extensive messages to help developer experience
		--quiet, -q        Silence everything but important warnings and errors

	Commands:
		build              Runs clean and builds a production build for client and server
		build:client 	   Cleans client build and produces a production build for client
		build:server 	   Cleans server build and productions a production build for the server
		start:dev          Starts a development server,
		start:prod         Starts a production server,
		clean 			   Cleans the client and server builds	
		prettier           Runs prettier on changed files
		prettier:all,      Runs prettier on all files
		prepare            Runs the build command and then runs prettier:all on files
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
	{ task: 'build', commands: [ buildAll ]},
	{ task: 'build:client', commands: [ cleanClient, buildClient ]},
	{ task: 'build:server', commands: [ cleanServer, buildServer ]},
	{ task: 'start:dev', commands: [ cleanClient, cleanServer, startDevServer ]},
	{ tasl: 'start:prod', commands: [ cleanClient, cleanServer, buildClient, buildServer, startProdServer ]},
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
