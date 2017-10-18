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
    build  				Cleans the build directories and the produces a production build of client and server
    build:client        Functions the same as build but only acts on the client bundles
    build:server        Functions the same as build but only acts on the server bundles
    clean               Cleans up the client and server build directories
    prettier            Runs prettier on changed files
    prettier:all        Runs prettier on all files
    prepare             Runs build first, and then will run prettier:all to format code
```


## Customizing
## Roadmap
## License