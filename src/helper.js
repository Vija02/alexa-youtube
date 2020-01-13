const chalk = require('chalk')

const state = require('../state')

exports.log = (...params) => console.log(chalk.yellow(...params))
exports.info = (...params) => console.info(chalk.blue(...params))
exports.error = (...params) => console.error(chalk.red(...params))

const getPlayParams = (method = 'REPLACE_ALL', videoId = null, previousToken = null) => {
	const id = videoId || state.videoId
	return [method, `${process.env.BACKEND_URL}/video/${id}`, id, 0, previousToken]
}
exports.getPlayParams = getPlayParams
