const { log, info, error } = require('../helper')

const state = require('../state')

const eventList = ['PlaybackStarted', 'PlaybackFinished', 'PlaybackStopped', 'PlaybackNearlyFinished', 'PlaybackFailed']

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

const PlaybackPausedHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === `AudioPlayer.PlaybackPaused`
	},
	async handle(handlerInput) {
		console.log('paused', JSON.stringify(handlerInput))
		return Promise.resolve(handlerInput.responseBuilder.getResponse())
	},
}

module.exports = [...standardHandlers, PlaybackPausedHandler]
