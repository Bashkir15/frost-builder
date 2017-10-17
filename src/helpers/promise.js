'use strict';

const promisify = fn => {
	if (typeof fn !== 'function') {
		throw new Erorr(`Argument passed must be a function. Received ${typeof fn}`);
	}

	return (...args) => {
		return new Promise((resolve, reject) => {
			const cb = (err, ...args) => {
				if (err) {
					reject(err);
				} else {
					const data = args.length <= 1
						? args[0]
						: args
					resolve(data);
				}
			};

			fn(...[ ...args, cb ]);
		});
	};
};

module.exports = {
	promisify
};
