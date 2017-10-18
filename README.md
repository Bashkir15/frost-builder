The Frost Builder is meant to be a hands-off, easy way to get started with Modern Web Applications

> This builder was made to be completely framework agnostic, and extremely configurable without actually having to edit the underlying configuration.

## Features

- Doesn't plan for or care what framework you are or are not using
- Semi-Automatic Code-Splitting for CSS and JS
- Supports CSS Modules for isolating component style
- Supports bundling both Client and Server bundles for isomorphic rendering
- Hot Loading for both the Client and the Server
- Includes Postcss as part of the chain
- Effective Build Caching using Webpacks Cache-Loader
- Efficient Long-Term caching using a custom hash-method
- Supports source-map and compile-time linting
- Comes packaged with prettier for lovely code!
- ServiceWorker Plugin out of the box, just tell the builder where your worker file is located
- Easy to use cli interface, but also exports the core functionality to use in an application directly

## Install
```console
$ npm install -D frost-builder
```

or
```console
$ yarn add -D frost-builder
```

## Usage

Using the builder from the command line is easy. Either install the builder globally and execute the commands below directly, or install it locally and use npm scripts to do the same.

```
Usage
	$ frost

Options:
	--verbose, -v  		Includes extensive messages to helper with developer experience
	--quiet, -q  		Surpresses everything but important warnings and errors

Commands:
    build  		Cleans the build directories and the produces a production build of client and server
    build:client        Functions the same as build but only acts on the client bundles
    build:server        Functions the same as build but only acts on the server bundles
    clean               Cleans up the client and server build directories
    prettier            Runs prettier on changed files
    prettier:all        Runs prettier on all files
    prepare             Runs build first, and then will run prettier:all to format code
```

For a more concrete example, say you want to spin up a development server for an isomorphic application you are building. Frost makes that simple.

```js
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackHotServerMiddleware from 'webpack-hot-server-middle-ware';
import express from 'express';
import { compiler } from 'frost-builder';

export function startServer(config = {}) {
	const clientConfig = compiler('client', 'development', config);
	const serverConfig = compiler('server', 'development', config);
	const multiCompiler = webpack([ clientConfig, serverConfig ]);
	const clientCompiler = multiCompiler.compilers[0];

	const devMiddleware = webpackDevMiddleware(multiCompiler, {
		publicPath: config.output.public,
		quiet: true,
		noInfo: true
	});
	const hotMiddleware = webpackHotMiddleware(clientCompiler);
	const hotServerMiddleware = webpackHotServerMiddleware(multiCompiler, {
		serverRendererOptions: {
			outputPath: config.output.client
		}
	});

	const server = express();
	server.use(express.static(config.output.public, config.output.client));
	server.use(devMiddleware);
	server.use(hotMiddleware);
	server.use(hotServerMiddleware);

	let serverIsStarted = false;

	multiCompiler.plugin('invalid', () => {
		console.log('compiling...');
	});

	multiCompiler.plugin('done', stats => {
		if (!stats.hasErrors() && !serverIsStarted) {
			serverIsStarted = true;
			server.listen(8000);
		}
	});
}
```


Want to spin up a production server? No Problem
> This is slightly different than the example pictured above. In this we are actually loading our config file, in the dev example picture above, it was assumed you were passing it as an agument. 
```js
import { resolve, dirname } from 'path';
import cosmiconfig from 'cosmiconfig';
import express from 'express';

const configLoader = cosmiconfig('frost', {
	stopDir: process.cwd()
});

async function main() {
	const { config, filepath } = await configLoader.load(__dirname);
	const root = dirname(filepath);

	const clientOutput = resolve(root, config.output.client);
	const serverOutput = resolve(root, config.output.server);

	const clientStats = require(`${clientOutput}/stats.json`);
	const serverRender = require(`${serverOutput}/main.js`).default;

	const server = express();
	server.use(express.static(config.output.public, clientOutput));
	server.listen(8000);
}

process.nextTick(main);
```

A little bit of boilerplate, but it is easy as that! Coming soon will be a frost-boilerplate will all of this setup for you!

## Customizing
## Roadmap

Coming Features! 

- Support for Dll plugin
- The ability to "eject" like you would with Create React App to edit the underlying config
- ...?

## License