const { log, info, error } = require('../helper')

const eventList = ['PlaybackStarted', 'PlaybackFinished', 'PlaybackStopped', 'PlaybackNearlyFinished', 'PlaybackFailed']

const handlers = eventList.map(eventName => {
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

module.exports = handlers
