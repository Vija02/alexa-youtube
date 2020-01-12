const { promisify } = require('util')
const Youtube = require('youtube-node')

const { log, info, error } = require('../helper')

const youtube = new Youtube()
youtube.setKey(process.env.YOUTUBE_KEY)
const youtubeSearchPromise = promisify(youtube.search)

let state = {
	playing: false,
	videoId: 'xgaAyr8lAdY',
}

const StartPlaybackHandler = {
	async canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request

		if (request.type === 'IntentRequest') {
			return request.intent.name === 'PlayAudio' || request.intent.name === 'AMAZON.ResumeIntent'
		}
	},
	handle(handlerInput) {
		return handlerInput.responseBuilder
			.speak('Starting')
			.addAudioPlayerPlayDirective(
				'REPLACE_ALL',
				`${process.env.BACKEND_URL}/video/${state.videoId}`,
				Math.random(),
				0,
				null,
			)
			.withShouldEndSession(true)
			.getResponse()
	},
}

const CustomVideoHandler = {
	async canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request

		if (request.type === 'IntentRequest') {
			return request.intent.name === 'GetVideoIntent'
		}
	},
	handle(handlerInput) {
		const query = handlerInput.requestEnvelope.request.intent.slots.VideoQuery
		info(`Got query: '${query.value}'`)

		return youtubeSearchPromise(query.value, 1)
			.then(res => {
				state.videoId = res.items[0].id.videoId

				return handlerInput.responseBuilder
					.speak(`Starting ${res.items[0].snippet.title}`)
					.addAudioPlayerPlayDirective(
						'REPLACE_ALL',
						`${process.env.BACKEND_URL}/video/${state.videoId}`,
						Math.random(),
						0,
						null,
					)
					.withShouldEndSession(true)
					.getResponse()
			})
			.catch(err => {
				console.log(err)
				reject(err)
			})
	},
}

module.exports = [StartPlaybackHandler, CustomVideoHandler]
