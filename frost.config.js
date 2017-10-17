const config = {
	entry: {
		client: 'client/index.js',
		server: 'server/index.js'
	},

	output: {
		client: 'build/client',
		server: 'build/server',
		public: '/static/'
	}
}