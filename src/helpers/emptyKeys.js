module.exports = obj => {
	const copy = {};
	for (const key in obj) {
		if (!(obj[key] === null || obj[key].length === 0)) {
			copy[key] = obj[key];
		}
	}
	return copy;
};
