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

exports.videoHistoryLength = 10

exports.chooseVideo = (youtubeRes, historyObj) => {
	for (let i = 0; i < youtubeRes.length; i++) {
		// Might have error accessing the ID if it's not a video object(?), let's just ignore it for now
		try {
			if (historyObj.includes(youtubeRes[i].id)) {
				return youtubeRes[i].id
			}
		} catch (e) {}
	}
	// Unlikely, but if all is selected... let's choose the last one :)
	return youtubeRes[youtubeRes.length - 1].id
}
