const Youtube = require('simple-youtube-api')

const { log, info, error } = require('../helper')

const youtube = new Youtube(process.env.YOUTUBE_KEY)

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

		return youtube.searchVideos(query.value, 1)
			.then(res => {
				state.videoId = res[0].id

				return handlerInput.responseBuilder
					.speak(`Starting ${res[0].title}`)
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
