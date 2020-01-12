require('dotenv-extended').load({ silent: false, errorOnMissing: true, includeProcessEnv: true })

// Check for env
if (!process.env.GENEROUS_CORS.match(/^(true|false)$/i)) {
	// If any is not filled, exit
	console.error('Error: 1 or more necessary environment variables are not set correctly.')
	process.exit(1)
}

const server = require('./src/server')
require('./src/youtubeProvider')(server)
require('./src/alexa')(server)

const port = process.env.PORT || 3000
server.listen(port)
console.log(`Server listening on port ${port}`)
