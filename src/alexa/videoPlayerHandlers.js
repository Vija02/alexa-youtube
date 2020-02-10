const Youtube = require('simple-youtube-api')
const youtube = new Youtube(process.env.YOUTUBE_KEY)

const { log, info, error, getPlayParams } = require('../helper')

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
			.addAudioPlayerPlayDirective(...getPlayParams(handlerInput.requestEnvelope.context.AudioPlayer.token))
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
	async handle(handlerInput) {
		const query = handlerInput.requestEnvelope.request.intent.slots.VideoQuery
		info(`Got query: '${query.value}'`)

		return youtube
			.searchVideos(query.value, 1)
			.then(res => {
				return handlerInput.responseBuilder
					.speak(`Starting ${res[0].title}`)
					.addAudioPlayerPlayDirective(...getPlayParams(res[0].id))
					.withShouldEndSession(true)
					.getResponse()
			})
			.catch(err => {
				console.log(err)
				reject(err)
			})
	},
}

const PauseHandler = {
	async canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request

		if (request.type === 'IntentRequest') {
			return request.intent.name === 'AMAZON.PauseIntent'
		}
	},
	handle(handlerInput) {
		return handlerInput.responseBuilder.addAudioPlayerStopDirective().getResponse()
	},
}

const ResumeHandler = {
	async canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request

		if (request.type === 'IntentRequest') {
			return request.intent.name === 'AMAZON.ResumeIntent'
		}
	},
	handle(handlerInput) {
		return handlerInput.responseBuilder
			.addAudioPlayerPlayDirective(...getPlayParams(handlerInput.requestEnvelope.context.AudioPlayer.token))
			.withShouldEndSession(true)
			.getResponse()
	},
}

const NextHandler = {
	async canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request

		if (request.type === 'IntentRequest') {
			return request.intent.name === 'AMAZON.NextIntent'
		}
	},
	async handle(handlerInput) {
		const lastPlayedVideoId = handlerInput.requestEnvelope.context.AudioPlayer.token
		return youtube
			.searchVideos('', 3, { relatedToVideoId: lastPlayedVideoId })
			.then(res => {
				return handlerInput.responseBuilder
					.speak(`Starting ${res[0].title}`)
					.addAudioPlayerPlayDirective(...getPlayParams(res[0].id))
					.withShouldEndSession(true)
					.getResponse()
			})
			.catch(err => {
				console.log(err)
			})
	},
}

module.exports = [StartPlaybackHandler, CustomVideoHandler, PauseHandler, ResumeHandler, NextHandler]
