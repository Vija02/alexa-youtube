const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const server = express()

if (!!process.env.GENEROUS_CORS.match(/true/i)) {
	server.use(cors())
}

server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())

module.exports = server
