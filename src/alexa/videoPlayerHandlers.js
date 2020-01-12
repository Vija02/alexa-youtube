const Youtube = require('simple-youtube-api')

const { log, info, error } = require('../helper')

const youtube = new Youtube(process.env.YOUTUBE_KEY)

const state = require('../state')

const getPlayParams = (method = 'REPLACE_ALL', videoId = null) => {
	const id = videoId || state.videoId
	return [method, `${process.env.BACKEND_URL}/video/${id}`, id, 0, null]
}
exports.getPlayParams = getPlayParams

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
			.addAudioPlayerPlayDirective(...getPlayParams())
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

		return youtube
			.searchVideos(query.value, 1)
			.then(res => {
				state.videoId = res[0].id

				return handlerInput.responseBuilder
					.speak(`Starting ${res[0].title}`)
					.addAudioPlayerPlayDirective(...getPlayParams())
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
			.addAudioPlayerPlayDirective(...getPlayParams())
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
	handle(handlerInput) {
		return youtube
			.searchVideos('', 1, { relatedToVideoId: state.videoId })
			.then(res => {
				state.videoId = res[0].id

				return handlerInput.responseBuilder
					.speak(`Starting ${res[0].title}`)
					.addAudioPlayerPlayDirective(...getPlayParams())
					.withShouldEndSession(true)
					.getResponse()
			})
			.catch(err => {
				console.log(err)
			})
	},
}

module.exports = [StartPlaybackHandler, CustomVideoHandler, PauseHandler, ResumeHandler, NextHandler]
