const { log, info, error } = require('../helper')

const state = require('../state')

const { getPlayParams } = require('./videoPlayerHandlers')

const eventList = ['PlaybackFinished', 'PlaybackStopped', 'PlaybackFailed']

const standardHandlers = eventList.map(eventName => {
	return {
		canHandle(handlerInput) {
			return handlerInput.requestEnvelope.request.type === `AudioPlayer.${eventName}`
		},
		async handle(handlerInput) {
			info(eventName)
			return Promise.resolve(handlerInput.responseBuilder.getResponse())
		},
	}
})

const PlaybackStartedHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === `AudioPlayer.PlaybackStarted`
	},
	async handle(handlerInput) {
		info(`PlaybackStarted. Setting videoId into: ${handlerInput.requestEnvelope.context.AudioPlayer.token}`)
		state.videoId = handlerInput.requestEnvelope.context.AudioPlayer.token

		return Promise.resolve(handlerInput.responseBuilder.getResponse())
	},
}

const PlaybackPausedHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === `AudioPlayer.PlaybackPaused`
	},
	async handle(handlerInput) {
		// TODO: Handle offset and stuff
		console.log('paused', JSON.stringify(handlerInput))
		return Promise.resolve(handlerInput.responseBuilder.getResponse())
	},
}

const PlaybackNearlyFinishedHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === `AudioPlayer.PlaybackNearlyFinished`
	},
	async handle(handlerInput) {
		info(`PlaybackNearlyFinished. Autoplay ${state.autoPlay ? 'Enabled' : 'Disabled'}`)
		if (state.autoPlay) {
			return youtube
				.searchVideos('', 1, { relatedToVideoId: state.videoId })
				.then(res => {
					info(`Queueing video with ID: ${res[0].id}. Was: ${state.videoId}`)
					return handlerInput.responseBuilder
						.addAudioPlayerPlayDirective(...getPlayParams('ENQUEUE', res[0].id, state.videoId))
						.withShouldEndSession(true)
						.getResponse()
				})
				.catch(err => {
					console.log(err)
				})
		}
		return Promise.resolve(handlerInput.responseBuilder.getResponse())
	},
}

module.exports = [...standardHandlers, PlaybackStartedHandler, PlaybackPausedHandler, PlaybackNearlyFinishedHandler]
