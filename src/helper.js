const chalk = require('chalk')

const state = require('./state')

exports.log = (...params) => console.log(chalk.yellow(...params))
exports.info = (...params) => console.info(chalk.blue(...params))
exports.error = (...params) => console.error(chalk.red(...params))

const getPlayParams = (videoId = null, method = 'REPLACE_ALL', previousToken = null) => {
	const id = videoId || state.videoId
	return [method, `${process.env.YOUTUBE_STREAMER_URL}/cache/${id}`, id, 0, previousToken]
}
exports.getPlayParams = getPlayParams
