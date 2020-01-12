const { log, info, error } = require('../helper')

const state = require('../state')

const { getPlayParams } = require('./videoPlayerHandlers')

const eventList = ['PlaybackFinished', 'PlaybackStopped', 'PlaybackNearlyFinished', 'PlaybackFailed']

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
		// TODO: Handle setting videoid state and stuff so we keep it updated
		console.log('Started', JSON.stringify(handlerInput))
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
		if (state.autoPlay) {
			return youtube
				.searchVideos('', 1, { relatedToVideoId: state.videoId })
				.then(res => {
					return handlerInput.responseBuilder
						.addAudioPlayerPlayDirective(...getPlayParams('ENQUEUE', res[0].id))
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
