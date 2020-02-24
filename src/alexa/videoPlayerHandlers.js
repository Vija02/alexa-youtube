const Youtube = require('simple-youtube-api')
const youtube = new Youtube(process.env.YOUTUBE_KEY)

const { log, info, error, getPlayParams, videoHistoryLength, chooseVideo } = require('../helper')

const state = require('../state')

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

		return youtube
			.searchVideos(query.value, videoHistoryLength + 1)
			.then(res => {
				const videoObj = chooseVideo(res, state.history)
				info(`GetVideoIntent \`${query.value}\` ${videoObj.id} \`${videoObj.title}\``)
				return handlerInput.responseBuilder
					.speak(`Starting ${videoObj.title}`)
					.addAudioPlayerPlayDirective(...getPlayParams(videoObj.id))
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
			.searchVideos('', videoHistoryLength + 1, { relatedToVideoId: lastPlayedVideoId })
			.then(res => {
				const videoObj = chooseVideo(res, state.history)
				info(`NextIntent ${lastPlayedVideoId} ${videoObj.id} \`${videoObj.title}\``)
				return handlerInput.responseBuilder
					.speak(`Starting ${videoObj.title}`)
					.addAudioPlayerPlayDirective(...getPlayParams(videoObj.id))
					.withShouldEndSession(true)
					.getResponse()
			})
			.catch(err => {
				console.log(err)
			})
	},
}

module.exports = [StartPlaybackHandler, CustomVideoHandler, PauseHandler, ResumeHandler, NextHandler]
